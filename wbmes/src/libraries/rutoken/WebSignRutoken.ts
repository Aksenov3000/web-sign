import { SimpleEventDispatcher } from 'ste-simple-events';
import { WebSignCertificate, IWebSign, IWebSignLog, WebSignLogEnum, WebSignLog } from '../common/index';
import { IWebSignCertificate } from '../common/IWebSignCertificate';
import { IWebSignSignature } from '../common/IWebSignSignature';
import { WebSignLogLevelEnum } from '../common/WebSignLogLevelEnum';
import { WebSignSignature } from '../common/WebSignSignature';
import { getPlugin } from './rutoken-plugin';
import { rutokenDeviceEvents } from './rutokenDeviceEvents';
import { rutokenEnumerateDevicesOptions } from './rutokenEnumerateDevicesOptions';
import { RutokenPluginClass } from './RutokenPluginClass';
import { rutokenPluginInfo } from './rutokenPluginInfo';
import { rutokenPluginWrap } from './rutokenPluginWrap';

/** IWebSign implementation for Rutoken Plugin Adapter  */
export class WebSignRutoken implements IWebSign
{
	/** Internal list of available certificates */
	private CertificateList = new Map<number, IWebSignCertificate[]>();

	/** Internal event on Certificate Add */
	private _OnCertificateAdd = new SimpleEventDispatcher<IWebSignCertificate>();

	/** Internal event on Certificate Remove */
	private _OnCertificateRemove = new SimpleEventDispatcher<IWebSignCertificate>();

	/** Internal event on Error */
	private _OnLog = new SimpleEventDispatcher<IWebSignLog>();


	private Plugin: RutokenPluginClass | undefined = undefined;
	private PluginFailed = false;
	private RutokenWrap: rutokenPluginWrap;
	private PluginInfo: rutokenPluginInfo = new rutokenPluginInfo();

	private TimerInterval: ReturnType<typeof setInterval> | number = 0;

	public LibraryName = 'Rutoken';

	/** 
		*  Event. New certificate is available
		* @remarks 
		* This event occurs when modules found new available certificate for sign.
		* Works after call to startCertificateScan.
	*/
	public get OnCertificateAdd() { return this._OnCertificateAdd.asEvent(); }

	/**
		*  Event. Certificate is now unavailable.
		*
		* @remarks
		* This event occurs when modules detect certificate removal.
		* Works after call to startCertificateScan.
	*/
	public get OnCertificateRemove() { return this._OnCertificateRemove.asEvent(); }

	/**
		*  Event. Common loger transport.
		*
		* @remarks
		* This event occurs when any log occurs.
	*/
	public get OnLog() { return this._OnLog.asEvent(); }

	constructor()
	{
		// ссылка на обертку плагина и расширения
		this.RutokenWrap = getPlugin();
	}

	private Log(level: WebSignLogLevelEnum, type: WebSignLogEnum, exception?)
	{
		this._OnLog.dispatchAsync(new WebSignLog(this.LibraryName, level, type, exception));
	}

	private getPlugin(): Promise<RutokenPluginClass>
	{
		return new Promise<RutokenPluginClass>((resolve, reject) =>
		{
			if (!this.RutokenWrap) 
			{
				reject('Internal error. Rutoken wrap not found');
				this.PluginFailed = true;
				return;
			}

			if (this.Plugin)
			{
				resolve(this.Plugin);
				return;
			}

			// получаем промис загрузки оболочки
			this.RutokenWrap.ready
				// ожидаем результата загрузки оболочки Рутокен (не расширения и не плагина, а только оболочки)
				.then(() =>
				{
					const isFirefox = !!window.navigator.userAgent.match(/firefox/i) && !window.navigator.userAgent.match(/seamonkey/i);

					if ((window as any).chrome || isFirefox)
					{
						// для хрома и файерфокса возвращаем промис проверки установки расширения
						return this.RutokenWrap.isExtensionInstalled();
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
					if (result) return this.RutokenWrap.isPluginInstalled();

					// если расширение не установлено, сообщаем об этом
					throw 'Rutoken extension not found';
				})
				// ожидаем проверки установки плагина
				.then((result) =>
				{
					// если плагин установлен, загружаем его
					if (result) return this.RutokenWrap.loadPlugin();

					// если плагин не установлен, сообщаем об этом
					throw 'Rutoken plagin not found';
				})
				// ожидаем запуска плагина
				.then((plugin: RutokenPluginClass) =>
				{
					//Можно начинать работать с плагином
					this.Plugin = plugin;
					this.PluginInfo.pluginVersion = plugin.version;
					resolve(this.Plugin);
				})
				// обработка ошибок этой цепочки промисов
				.then(undefined, (reason) =>
				{
					this.PluginFailed = true;
					reject('Rutoken plugin failed to load - ' + reason);
				});
		});
	}

	private DeleteCertificatesFromDevice(device: number): void
	{
		const list: IWebSignCertificate[] = this.CertificateList.get(device);
		if (list === undefined) return;

		list.forEach((cert) =>
		{
			this._OnCertificateRemove.dispatchAsync(cert);
		});

		this.CertificateList.delete(device);
	}

	private EnumDevices(plugin: RutokenPluginClass)
	{
		this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.EnumDevices);
		// получаем все события по подключению и отключению токенов
		plugin.enumerateDevices({ 'mode': plugin.ENUMERATE_DEVICES_EVENTS } as rutokenEnumerateDevicesOptions)
			// получаем список присоединенных и отсоединенных токенов с момента последнего запроса
			.then(
				(devices: rutokenDeviceEvents) =>
				{
					// удалить из списка сертификатов (плюс события про удаление каждого)
					devices.disconnected.forEach((d)=>this.DeleteCertificatesFromDevice(d));

					// прочитать все сертификаты из добавленного устройства
					devices.connected.forEach((c) => this.EnumCertificates(plugin, c));
				},
				(ex) =>
				{
					this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
				});
	}

	private EnumCertificates(plugin: RutokenPluginClass, device: number)
	{
		this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.EnumCertificatesInStore);
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

					const cert: IWebSignCertificate = new WebSignCertificate(
						this.LibraryName + '|' + device + '|' + thumbprint,
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

					let list: WebSignCertificate[] = this.CertificateList.get(device);
					if (list === undefined)
					{
						list = [];
						this.CertificateList.set(device, list);
					}
					list.push(cert);

					this._OnCertificateAdd.dispatchAsync(cert);
				});
			})
			.catch((ex) =>
			{
				this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
			});
	}

	public StartCertificateScan()
	{
		this.PluginFailed = false;
		this.Plugin = undefined;

		this.TimerInterval = setInterval(() =>
		{
			this.getPlugin()
				.then((plugin) => this.EnumDevices(plugin))
				.catch((ex) =>
				{
					this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
					if (this.PluginFailed) clearInterval(this.TimerInterval);
				});
		}, 500);
	}

	public StopCertificateScan()
	{
		clearInterval(this.TimerInterval);
	}

	public SignHash(certificate: IWebSignCertificate, algorithmOid: string, hashAsHex: string): Promise<IWebSignSignature>
	{
		return new Promise<IWebSignSignature>((resolve, reject) =>
		{
			if (!this.CertificateList) reject('dummy error');
			resolve(new WebSignSignature(certificate, algorithmOid, hashAsHex, 'Signature rutoken'));
			return;
		});
	}
}
