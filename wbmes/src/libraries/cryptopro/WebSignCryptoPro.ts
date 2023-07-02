import { WebSignCertificate, WebSignSignature, IWebSign, WebSignLogEnum, IWebSignLog } from '../common/index';
import { IAbout3 } from './IAbout3';
import { IVersion } from './IVersion';
import { CadesPluginClass } from './CadesPluginClass';
import { getPlugin } from './cadesplugin_api';
import { CryptoProPluginInfo } from './CryptoProPluginInfo';
import { IStore } from './IStore';
import { ICertificates } from './ICertificates';
import { ICertificate } from './ICertificate';
import { IWebSignSignature } from '../common/IWebSignSignature';
import { IWebSignCertificate } from '../common/IWebSignCertificate';
import { SimpleEventDispatcher } from 'ste-simple-events';
import { WebSignLog } from '../common/WebSignLog';
import { WebSignLogLevelEnum } from '../common/WebSignLogLevelEnum';

/** IWebSign implementation for CryptoPro Extension for CAdES Browser Plug-in  */
export class WebSignCryptoPro implements IWebSign
{
	/** Internal list of available certificates */
	private CertificateList = new Map<string, IWebSignCertificate[]>();

	/** Internal event on Certificate Add */
	private _OnCertificateAdd = new SimpleEventDispatcher<IWebSignCertificate>();

	/** Internal event on Certificate Remove */
	private _OnCertificateRemove = new SimpleEventDispatcher<IWebSignCertificate>();

	/** Internal event on Error */
	private _OnLog = new SimpleEventDispatcher<IWebSignLog>();

	private CadesPlugin: CadesPluginClass;
	private PluginInfo: CryptoProPluginInfo = new CryptoProPluginInfo();

	public LibraryName = 'CryptoPro';

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
		this.CadesPlugin = getPlugin();
	}

	private Log(level: WebSignLogLevelEnum, type: WebSignLogEnum, exception?)
	{
		this._OnLog.dispatchAsync(new WebSignLog(this.LibraryName, level, type, exception));
	}

	private getPluginInfo(next_function: () => void): void
	{
		if (!this.CadesPlugin)
		{
			this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.PluginNotFound);
			return;
		}

		this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.LoadPluginObject);
		this.CadesPlugin.then(
			async () => // fullfilled
			{
				try
				{
					// CreatePluginObject
					this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.CreatePluginObject);
					const oAbout: IAbout3 = await this.CadesPlugin.CreateObjectAsync('CAdESCOM.About');

					// Get Plugin Version
					this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.GetPluginVersion);
					let ver: IVersion = await oAbout.PluginVersion;
					this.PluginInfo.pluginVersion = (await ver.MajorVersion) + '.' + (await ver.MinorVersion) + '.' + (await ver.BuildVersion);

					// Get CSP Version
					this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.GetCSPVersion);
					ver = await oAbout.CSPVersion('', 80);
					this.PluginInfo.cspVersion = (await ver.MajorVersion) + '.' + (await ver.MinorVersion) + '.' + (await ver.BuildVersion);
					try { this.PluginInfo.cspName = await oAbout.CSPName(80); } catch (e) { this.PluginInfo.cspName = ''; }

					// вызываем следующую функцию в цепочке
					if (next_function) next_function();
				}
				catch (ex)
				{
					this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
				}
			},
			(ex) => // rejected
			{
				this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
			}
		);
	}


	public StartCertificateScan()
	{
		this.CadesPlugin.then(
			() => // fullfilled
			{
				this.getPluginInfo(() => this.GetCertificateList());     ///////////////////////  TODO неправильное смешивание синхронных функций и асинхронных
			},
			(ex) => // rejected
			{
				this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
			}
		);
	}

	private async GetCertificateList()
	{
		const deviceName = 'CryptoApi';
		let oStore: IStore | undefined = undefined;

		try
		{
			this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.OpenCertificateStore);
			oStore = await this.CadesPlugin.CreateObjectAsync('CAdESCOM.Store');
			if (!oStore) throw 'Объект или свойство не найдено. (0x80092004)';
			await oStore.Open();

			this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.GetCertificateListFromStore);
			const certs: ICertificates = await oStore.Certificates;
			if (!certs) throw 'Объект или свойство не найдено. (0x80092004)';

			this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.GetCertificateCountFromStore);
			const certCnt = await certs.Count;
			// Если сертификатов нет, то дальше делать нечего
			if (certCnt === 0) return;

			for (let i = 1; i <= certCnt; i++)
			{
				this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.EnumCertificatesInStore);
				const cert: ICertificate = await certs.Item(i);

				this.Log(WebSignLogLevelEnum.Debug, WebSignLogEnum.GetCertificateFromStore);
				const publicKeyAlgorithm = await (await cert.PublicKey()).Algorithm;
				const thumbprint: string = await cert.Thumbprint;

				this._OnCertificateAdd.dispatchAsync(new WebSignCertificate(
					this.LibraryName + '|' + deviceName + '|' + thumbprint,
					await cert.Export(this.CadesPlugin.CADESCOM_ENCODE_BASE64),
					thumbprint,
					new Date(await cert.ValidFromDate),
					new Date(await cert.ValidToDate),
					await cert.SubjectName,
					await cert.IssuerName,
					await cert.HasPrivateKey(),
					await publicKeyAlgorithm.FriendlyName,
					await publicKeyAlgorithm.Value
				));
			}
		}
		catch (ex)
		{
			this.Log(WebSignLogLevelEnum.Error, WebSignLogEnum.UnexpectedException, ex);
		}
		finally
		{
			if (oStore) await oStore.Close();
		}
	}

	public StopCertificateScan()
	{
		// do nothing
	}

	public SignHash(certificate: IWebSignCertificate, algorithmOid: string, hashAsHex: string): Promise<IWebSignSignature>
	{
		return new Promise<IWebSignSignature>((resolve, reject) =>
		{
			if (!this.CertificateList) reject('dummy error');
			resolve(new WebSignSignature(certificate, algorithmOid, hashAsHex, 'Signature cp'));
			return;
		});
	}
}
