import { SimpleEventDispatcher } from 'ste-simple-events';
import { WebSignCertificate, IWebSign, IWebSignLog, WebSignLogEnum, WebSignLog } from '../common/index';
import { IWebSignCertificate } from '../common/IWebSignCertificate';
import { IWebSignSignature } from '../common/IWebSignSignature';
import { WebSignLogLevelEnum } from '../common/WebSignLogLevelEnum';
import { WebSignSignature } from '../common/WebSignSignature';
import { getRutokenWrap } from './rutoken-plugin';
import { RutokenDeviceEvents } from './RutokenDeviceEvents';
import { RutokenEnumerateDevicesOptions } from './RutokenEnumerateDevicesOptions';
import { RutokenPluginClass } from './RutokenPluginClass';
import { RutokenPluginInfo } from './RutokenPluginInfo';
import { RutokenPluginWrap } from './RutokenPluginWrap';

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
	private RutokenWrap: RutokenPluginWrap;
	private PluginInfo: RutokenPluginInfo = new RutokenPluginInfo();

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

	/** Main constructor */
	constructor()
	{
		// get plugin wrapper
		this.RutokenWrap = getRutokenWrap();
	}

	private Log(level: WebSignLogLevelEnum, type: WebSignLogEnum, exception?)
	{
		this._OnLog.dispatchAsync(new WebSignLog(this.LibraryName, level, type, exception));
	}

	/** Promise to start working with this class */
	public get Ready(): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			if (!this.RutokenWrap)
			{
				this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.WrapNotFound);
				reject('Rutoken plugin wrapper not found');
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
					resolve();
				})
				// обработка ошибок этой цепочки промисов
				.then(undefined, (ex) =>
				{
					this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.LoadPluginObject, ex);
					reject('Rutoken plugin failed to load - ' + ex);
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

	private EnumDevices()
	{
		this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.EnumDevices);
		// получаем все события по подключению и отключению токенов
		this.Plugin.enumerateDevices({ 'mode': this.Plugin.ENUMERATE_DEVICES_EVENTS } as RutokenEnumerateDevicesOptions)
			// получаем список присоединенных и отсоединенных токенов с момента последнего запроса
			.then(
				(devices: RutokenDeviceEvents) =>
				{
					// удалить из списка сертификатов (плюс события про удаление каждого)
					devices.disconnected.forEach((d) => this.DeleteCertificatesFromDevice(d));

					// прочитать все сертификаты из добавленного устройства
					devices.connected.forEach((c) => this.EnumCertificates(c));
				},
				(ex) =>
				{
					this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
				});
	}

	private EnumCertificates(device: number)
	{
		this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.EnumCertificatesInStore);
		// CERT_CATEGORY_USER
		// CERT_CATEGORY_CA
		// CERT_CATEGORY_OTHER
		// CERT_CATEGORY_UNSPEC
		this.Plugin.enumerateCertificates(device, this.Plugin.CERT_CATEGORY_USER)
			.then((certificates: string[]) =>
			{
				certificates.forEach((c) =>
				{
					const thumbprint = c.toUpperCase().replace(/[:]/gi, '');

					let certBody = '';
					this.Plugin.getCertificate(device, c).then(
						(base64cert) =>
						{
							certBody = base64cert;
							const cert: IWebSignCertificate = new WebSignCertificate(
								this.LibraryName + '|' + device + '|' + thumbprint,
								this.LibraryName,
								device.toString(),
								certBody,
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

						})
						.catch(
							(ex) =>
							{
								this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
							});
				});
			})
			.catch((ex) =>
			{
				this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
			});
	}

	public StartCertificateScan()
	{
		if (!this.Plugin)
		{
			this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.LoadPluginObject);
			return;
		}
		this.TimerInterval = setInterval(() => this.EnumDevices(), 500);
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
