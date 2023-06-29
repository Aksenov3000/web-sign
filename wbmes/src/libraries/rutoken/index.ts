import { webSignCertificate, webSignError, webSignSignature, webSignInterface } from '../common/index';
import { getPlugin } from './rutoken-plugin';
import { rutokenDeviceEvents } from './rutokenDeviceEvents';
import { rutokenEnumerateDevicesOptions } from './rutokenEnumerateDevicesOptions';
import { rutokenPluginClass } from './rutokenPluginClass';
import { rutokenPluginInfo } from './rutokenPluginInfo';
import { rutokenPluginWrap } from './rutokenPluginWrap';

/** webSignInterface implementation for Rutoken Plugin Adapter  */
export default class webSignRutoken implements webSignInterface
{
	// certificate list.
	private certificateList = new Map<number, webSignCertificate[]>();

	private plugin: rutokenPluginClass | undefined = undefined;
	private pluginFailed = false;
	private rutokenWrap: rutokenPluginWrap;
	private pluginInfo: rutokenPluginInfo = new rutokenPluginInfo();

	private timerInterval: ReturnType<typeof setInterval> | number = 0;

	public onCertificateAdd?: (certificate: webSignCertificate) => void;
	public onCertificateRemove?: (certificate: webSignCertificate) => void;
	public onError?: (error: webSignError) => void;
	public onSignComplete?: (error: webSignSignature) => void;

	public libraryName = 'Rutoken';

	constructor()
	{
		// ссылка на обертку плагина и расширения
		this.rutokenWrap = getPlugin();
	}

	private getPlugin(): Promise<rutokenPluginClass>
	{
		return new Promise<rutokenPluginClass>((resolve, reject) =>
		{
			if (!this.rutokenWrap) 
			{
				reject('Internal error. Rutoken оболочка не найдена');
				this.pluginFailed = true;
				return;
			}

			if (this.plugin)
			{
				resolve(this.plugin);
				return;
			}

			// получаем промис загрузки оболочки
			this.rutokenWrap.ready
				// ожидаем результата загрузки оболочки Рутокен (не расширения и не плагина, а только оболочки)
				.then(() =>
				{
					const isFirefox = !!window.navigator.userAgent.match(/firefox/i) && !window.navigator.userAgent.match(/seamonkey/i);

					if ((window as any).chrome || isFirefox)
					{
						// для хрома и файерфокса возвращаем промис проверки установки расширения
						return this.rutokenWrap.isExtensionInstalled();
					}
					else
					{
						// для остальных браузеров расширение не ищется и считается что оно не нужно
						return Promise.resolve(true);
					}
				})
				// ожидаем проверки установки расширения
				.then((result) =>
				{
					// если расширение установлено, проверяем установку плаигна
					if (result) return this.rutokenWrap.isPluginInstalled();

					// если расширение не установлено, сообщаем об этом
					throw 'Rutoken расширение не найдено';
				})
				// ожидаем проверки установки плагина
				.then((result) =>
				{
					// если плагин установлен, загружаем его
					if (result) return this.rutokenWrap.loadPlugin();

					// если плагин не установлен, сообщаем об этом
					throw 'Rutoken плагин не найден';
				})
				// ожидаем запуска плагина
				.then((plugin: rutokenPluginClass) =>
				{
					//Можно начинать работать с плагином
					this.plugin = plugin;
					this.pluginInfo.pluginVersion = plugin.version;
					resolve(this.plugin);
				})
				// обработка ошибок этой цепочки промисов
				.then(undefined, (reason) =>
				{
					this.pluginFailed = true;
					reject('Rutoken плагин не удалось загрузить - ' + reason);
				});
		});
	}

	private deleteCertificatesFromDevice(device: number): void
	{
		const list: webSignCertificate[] = this.certificateList.get(device);
		if (list === undefined) return;

		list.forEach((cert) =>
		{
			if (this.onCertificateRemove) this.onCertificateRemove(cert);
		});

		this.certificateList.delete(device);
	}

	private enumDevices(plugin: rutokenPluginClass)
	{
		// получаем все события по подключению и отключению токенов
		plugin.enumerateDevices({ 'mode': plugin.ENUMERATE_DEVICES_EVENTS } as rutokenEnumerateDevicesOptions)
			// получаем список присоединенных и отсоединенных токенов с момента последнего запроса
			.then(
				(devices: rutokenDeviceEvents) =>
				{
					// удалить из списка сертификатов (плюс события про удаление каждого)
					devices.disconnected.forEach((d)=>this.deleteCertificatesFromDevice(d));

					// прочитать все сертификаты из добавленного устройства
					devices.connected.forEach((c) => this.enumCertificates(plugin, c));
				},
				(reason) =>
				{
					if (this.onError) this.onError(new webSignError('1000', 'Rutoken плагин - enumerateDevices - ' + reason, null));
				});
	}

	private enumCertificates(plugin: any, device: number)
	{
		// CERT_CATEGORY_USER
		// CERT_CATEGORY_CA
		// CERT_CATEGORY_OTHER
		// CERT_CATEGORY_UNSPEC
		plugin.enumerateCertificates(device, plugin.CERT_CATEGORY_USER)
			.then((certificates:string[]) =>
			{
				certificates.forEach((c) =>
				{
					const thumbprint = c.toUpperCase().replace(/[:]/gi, '');

					const cert: webSignCertificate = new webSignCertificate(
						this.libraryName + '|' + device + '|' + thumbprint,
						'base64',
						thumbprint,
						new Date(),
						new Date(),
						'SubjectName',
						'IssuerName',
						false,
						'cKeyAlgorithm.FriendlyName',
						'cKeyAlgorithm.Value'
					);

					let list: webSignCertificate[] = this.certificateList.get(device);
					if (list === undefined)
					{
						list = [];
						this.certificateList.set(device, list);
					}
					list.push(cert);

					if (this.onCertificateAdd) this.onCertificateAdd(cert);
				});
			})
			.catch((reason) =>
			{
				if (this.onError) this.onError(new webSignError('1000', 'Rutoken плагин - ' + reason, null));
			});
	}

	public startCertificateScan()
	{
		this.pluginFailed = false;
		this.plugin = undefined;

		this.timerInterval = setInterval(() =>
		{
			this.getPlugin()
				.then((plugin) => this.enumDevices(plugin))
				.catch((reason) =>
				{
					if (this.onError) this.onError(new webSignError('1000', 'Rutoken плагин - ' + reason, null));
					if (this.pluginFailed) clearInterval(this.timerInterval);
				});
		}, 500);
	}

	public stopCertificateScan()
	{
		clearInterval(this.timerInterval);
	}

	public signHash(certificate: webSignCertificate, algorithmOid: string, hashAsHex: string)
	{
		// save result
		if (this.onSignComplete) this.onSignComplete(new webSignSignature(certificate, algorithmOid, hashAsHex, 'Signature ru'));
	}
}
