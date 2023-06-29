import { webSignCertificate, webSignError, webSignSignature, webSignInterface } from '../common/index';
import { IAbout3 } from './IAbout3';
import { IVersion } from './IVersion';
import { cadesPluginClass } from './cadesPluginClass';
import { getPlugin } from './cadesplugin_api';
import { cryptoProPluginInfo } from './cryptoProPluginInfo';
import { IStore } from './IStore';
import { ICertificates } from './ICertificates';
import { ICertificate } from './ICertificate';

/** webSignInterface implementation for CryptoPro Extension for CAdES Browser Plug-in  */
export default class webSignCryptoPro implements webSignInterface
{
	// certificate list.
	//private certificateList = new Map<string, webSignCertificate>();
	//private common = new webSignCommon();

	private cadesplugin: cadesPluginClass;
	private pluginInfo: cryptoProPluginInfo = new cryptoProPluginInfo();

	public onCertificateAdd?: (certificate: webSignCertificate) => void;
	public onCertificateRemove?: (certificate: webSignCertificate) => void;
	public onError?: (error: webSignError) => void;
	public onSignComplete?: (error: webSignSignature) => void;

	public libraryName = 'CryptoPro';


	constructor()
	{
		this.cadesplugin = getPlugin();
	}

	private getPluginInfo(next_function:()=>void):void
	{
		if (!this.cadesplugin)
		{
			if (this.onError) this.onError(new webSignError('1000', 'Плагин не найден', null));
			return;
		}
		this.cadesplugin.then(
			async () => // fullfilled
			{
				try
				{
					// собираем информацию о плагине
					const oAbout: IAbout3 = await this.cadesplugin.CreateObjectAsync('CAdESCOM.About');

					// версия плагина
					let ver: IVersion = await oAbout.PluginVersion;
					this.pluginInfo.pluginVersion = (await ver.MajorVersion) + '.' + (await ver.MinorVersion) + '.' + (await ver.BuildVersion);

					// версия CSP
					ver = await oAbout.CSPVersion('', 80);
					this.pluginInfo.cspVersion = (await ver.MajorVersion) + '.' + (await ver.MinorVersion) + '.' + (await ver.BuildVersion);
					try { this.pluginInfo.cspName = await oAbout.CSPName(80); } catch (e) { this.pluginInfo.cspName = ''; }

					// вызываем следующую функцию в цепочке
					if (next_function) next_function();
				}
				catch (ex)
				{
					if (this.onError) this.onError(new webSignError('1001', 'Получение информации о плагине', ex));
				}
			},
			(ex) => // rejected
			{
				if (this.onError) this.onError(new webSignError('1002', 'Проверка плагина не удалась', ex));
			}
		);
	}


	public startCertificateScan()
	{
		if (!this.onCertificateAdd) return;

		this.cadesplugin.then(
			() => // fullfilled
			{
				this.getPluginInfo(() => this.getCertificateList());
			},
			(reason) => // rejected
			{
				if (this.onError) this.onError(new webSignError('1002', 'Проверка плагина не удалась', reason));
			}
		);
	}

	private async getCertificateList()
	{
		const deviceName = 'CryptoApi';
		let oStore:IStore | undefined = undefined;
		let stage_message = '';

		try
		{
			stage_message = 'Ошибка при открытии хранилища: ';
			oStore = await this.cadesplugin.CreateObjectAsync('CAdESCOM.Store');
			if (!oStore) throw 'Объект или свойство не найдено. (0x80092004)';
			await oStore.Open();

			stage_message = 'Ошибка при получении коллекции сертификатов: ';
			const certs: ICertificates = await oStore.Certificates;
			if (!certs) throw 'Объект или свойство не найдено. (0x80092004)';

			stage_message = 'Ошибка при определении количества сертификатов: ';
			const certCnt = await certs.Count;
			// Если сертификатов нет, то дальше делать нечего
			if (certCnt === 0) return;

			for (let i = 1; i <= certCnt; i++)
			{
				stage_message = 'Ошибка при перечислении сертификатов: ';
				const cert: ICertificate = await certs.Item(i);

				stage_message = 'Ошибка при получении свойств сертификата: ';
				const PublicKeyAlgorithm = await (await cert.PublicKey()).Algorithm;

				const thumbprint: string = await cert.Thumbprint;

				if (this.onCertificateAdd)
					this.onCertificateAdd(new webSignCertificate(
						this.libraryName + '|' + deviceName + '|' + thumbprint,
						await cert.Export(this.cadesplugin.CADESCOM_ENCODE_BASE64),
						thumbprint,
						new Date(await cert.ValidFromDate),
						new Date(await cert.ValidToDate),
						await cert.SubjectName,
						await cert.IssuerName,
						await cert.HasPrivateKey(),
						await PublicKeyAlgorithm.FriendlyName,
						await PublicKeyAlgorithm.Value
					));
			}
		}
		catch (ex)
		{
			if (this.onError) this.onError(new webSignError('1003', stage_message, ex));
		}
		finally
		{
			if (oStore) await oStore.Close();
		}
	}

	public stopCertificateScan()
	{
		// do nothing
	}

	public signHash(certificate: webSignCertificate, algorithmOid: string, hashAsHex: string)
	{
		// save result
		if (this.onSignComplete) this.onSignComplete(new webSignSignature(certificate, algorithmOid, hashAsHex, 'Signature cp'));
	}
}
