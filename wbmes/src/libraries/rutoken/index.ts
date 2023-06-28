// include libraries
import { webSignCertificate, webSignCommon, webSignError, webSignSignature, webSignInterface } from '../common/index';
import * as RutokenPluginApiDummy from './rutoken-plugin';
import { rutokenDeviceEvents } from './rutokenDeviceEvents';
import { rutokenPluginInfo } from './rutokenPluginInfo';

// main class
export default class webSignRutoken implements webSignInterface
{
	// certificate list.
	private certificateList = new Map<string, webSignCertificate>();
	private common = new webSignCommon();
	public TRUE: boolean;
	public FALSE: boolean;

	private plugin: any = undefined;
	private rutokenWrap: any = undefined;
	private pluginInfo: rutokenPluginInfo = new rutokenPluginInfo();

	private timerInterval: ReturnType<typeof setInterval> | number = 0;

	public onCertificateAdd?: (certificate: webSignCertificate) => void;
	public onCertificateRemove?: (certificate: webSignCertificate) => void;
	public onError?: (error: webSignError) => void;
	public onSignComplete?: (error: webSignSignature) => void;

	public libraryName: string = "Rutoken";

	public v: any = RutokenPluginApiDummy;

	constructor()
	{
		// Печальный Dependency Injection
		this.TRUE = RutokenPluginApiDummy.tr(1);
		this.FALSE = RutokenPluginApiDummy.fa(1);

		// ссылка на обертку плагина и расширения
		this.rutokenWrap = (window as any).rutoken;
	}

	private getPlugin(): Promise<any>
	{
		let my = this;

		return new Promise<any>((resolve, reject) =>
		{
			if (!my.rutokenWrap) 
			{
				reject('Internal error. Rutoken оболочка не найдена');
				return;
			}

			if (my.plugin)
			{
				resolve(my.plugin);
				return;
			}

			// получаем промис загрузки оболочки
			my.rutokenWrap.ready
				// ожидаем результата загрузки оболочки Рутокен (не расширения и не плагина, а только оболочки)
				.then(function ()
				{
					const isFirefox = !!(window as any).navigator.userAgent.match(/firefox/i) && !(window as any).navigator.userAgent.match(/seamonkey/i);

					if ((window as any).chrome || isFirefox)
					{
						// для хрома и файерфокса возвращаем промис проверки установки расширения
						return my.rutokenWrap.isExtensionInstalled();
					}
					else
					{
						// для остальных браузеров расширение не ищется и считается что оно не нужно
						return Promise.resolve(true);
					}
				})
				// ожидаем проверки установки расширения
				.then(function (result)
				{
					// если расширение установлено, проверяем установку плаигна
					if (result) return my.rutokenWrap.isPluginInstalled();

					// если расширение не установлено, сообщаем об этом
					throw "Rutoken расширение не найдено";
				})
				// ожидаем проверки установки плагина
				.then(function (result)
				{
					// если плагин установлен, загружаем его
					if (result) return my.rutokenWrap.loadPlugin();

					// если плагин не установлен, сообщаем об этом
					throw "Rutoken плагин не найден";
				})
				// ожидаем запуска плагина
				.then(function (plugin)
				{
					//Можно начинать работать с плагином
					my.plugin = plugin;
					my.pluginInfo.pluginVersion = plugin.version;
					resolve(my.plugin);
				})
				// обработка ошибок этой цепочки промисов
				.then(undefined, function (reason)
				{
					reject('Rutoken плагин не удалось загрузить - ' + reason);
				});
		});
	}

	private deleteCertificatesFromDevice(device: number): void
	{

	}

	private enumDevices(plugin: any)
	{
		let my = this;

		// получаем все события по подключению и отключению токенов
		plugin.enumerateDevices({ "mode": plugin.ENUMERATE_DEVICES_EVENTS })
			// получаем список присоединенных и отсоединенных токенов с момента последнего запроса
			.then(
				(devices: rutokenDeviceEvents) =>
				{
					if (my.onError) my.onError(new webSignError('1000', 'Rutoken плагин - connected:' + devices.connected + ' disconnected:' + devices.disconnected, null));

					// удалить из списка сертификатов (плюс события про удаление каждого)
					devices.disconnected.forEach((d)=>my.deleteCertificatesFromDevice(d));

					// прочитать все сертификаты из добавленного устройства
					devices.connected.forEach((c) => my.enumCertificates(plugin, c));
				},
				(reason) =>
				{
					if (my.onError) my.onError(new webSignError('1000', 'Rutoken плагин - enumerateDevices - ' + reason, null));
				});
	}

	private enumCertificates(plugin: any, device: number)
	{
		let my = this;

		// CERT_CATEGORY_USER
		// CERT_CATEGORY_CA
		// CERT_CATEGORY_OTHER
		// CERT_CATEGORY_UNSPEC
		plugin.enumerateCertificates(device, plugin.CERT_CATEGORY_USER)
			.then((certificates:string[]) =>
			{
				certificates.forEach((c) =>
				{
					if (my.onCertificateAdd)
						my.onCertificateAdd(new webSignCertificate(
							my.libraryName + '|' + device + '|' + c,
							"base64",
							c,
							new Date(),
							new Date(),
							'SubjectName',
							'IssuerName',
							false,
							'cKeyAlgorithm.FriendlyName',
							'cKeyAlgorithm.Value'
						));

				});
			})
			.catch((reason) =>
			{
				if (my.onError) my.onError(new webSignError('1000', 'Rutoken плагин - ' + reason, null));
			});
	}

	public startCertificateScan()
	{
		let my = this;

		my.timerInterval = setInterval(() =>
		{
			my.getPlugin()
				.then((plugin) => my.enumDevices(plugin))
				.catch((reason) =>
				{
					if (my.onError) my.onError(new webSignError('1000', 'Rutoken плагин - ' + reason, null));
				});
		}, 1000);
	}

	public stopCertificateScan()
	{
		let my = this;

		clearInterval(my.timerInterval);
	}

	public signHash(certificate: webSignCertificate, algorithmOid: string, hashAsHex: string)
	{
		// save result
		if (this.onSignComplete) this.onSignComplete(new webSignSignature(certificate, algorithmOid, hashAsHex, "Signature ru"));
	}
}
