// include libraries
import { webSignCertificate, webSignError, webSignSignature, webSignInterface } from '../common/index';
import * as CadesPluginApiDummy from './cadesplugin_api';
import { cryptoProPluginInfo } from './cryptoProPluginInfo';

// main class
export default class webSignCryptoPro implements webSignInterface
{
	// certificate list.
	//private certificateList = new Map<string, webSignCertificate>();
	//private common = new webSignCommon();
	public TRUE: boolean;
	public FALSE: boolean;

	private cadesplugin: any;
	private pluginInfo: cryptoProPluginInfo = new cryptoProPluginInfo();

	public onCertificateAdd?: (certificate: webSignCertificate) => void;
	public onCertificateRemove?: (certificate: webSignCertificate) => void;
	public onError?: (error: webSignError) => void;
	public onSignComplete?: (error: webSignSignature) => void;

	public libraryName: string = "CryptoPro";


	constructor()
	{
		// Печальный Dependency Injection
		this.TRUE = CadesPluginApiDummy.tr(1);
		this.FALSE = CadesPluginApiDummy.fa(1);

		// ссылка на проинициализированный плагин для расширения
		this.cadesplugin = (window as any).cadesplugin;

		// выключаем функционал запроса на автоматическую установку расширения, если оно не найдено
		(window as any).cadesplugin_skip_extension_install = true;
	}

	private getPluginInfo(next_function:()=>void):void
	{
		let my = this;

		if (!my.cadesplugin)
		{
			if (my.onError) my.onError(new webSignError('1000', 'Плагин не найден', null));
			return;
		}
		my.cadesplugin.then(function ()
		{
			my.cadesplugin.async_spawn(function* ()
			{
				try
				{
					// собираем информацию о плагине
					var oAbout = yield my.cadesplugin.CreateObjectAsync("CAdESCOM.About");

					// версия плагина
					var ver = yield oAbout.PluginVersion;
					my.pluginInfo.pluginVersion = (yield ver.MajorVersion) + "." + (yield ver.MinorVersion) + "." + (yield ver.BuildVersion);

					// версия CSP
					ver = yield oAbout.CSPVersion("", 80);
					my.pluginInfo.cspVersion = (yield ver.MajorVersion) + "." + (yield ver.MinorVersion) + "." + (yield ver.BuildVersion);
					try { my.pluginInfo.cspName = yield oAbout.CSPName(80); } catch (e) { my.pluginInfo.cspName = ""; }

					// вызываем следующую функцию в цепочке
					if (next_function) next_function();
				}
				catch (ex)
				{
					if (my.onError) my.onError(new webSignError('1001', 'Получение информации о плагине', ex));
				}
			});
		},
			function (ex)
			{
				if (my.onError) my.onError(new webSignError('1002', 'Проверка плагина не удалась', ex));
			}
		);
	}


	public startCertificateScan()
	{
		let my = this;
		if (!my.onCertificateAdd) return;

		my.cadesplugin.then(function ()
		{
			my.getPluginInfo(()=>my.getCertificateList());
		},
			function (ex)
			{
				if (my.onError) my.onError(new webSignError('1002', 'Проверка плагина не удалась', ex));
			}
		);
	}

	private getCertificateList():void
	{
		let my = this;
		my.cadesplugin.async_spawn(function* ()
		{
			let deviceName = 'CryptoApi';
			let oStore: any = null;
			let stage_message: string = '';

			try
			{
				stage_message = "Ошибка при открытии хранилища: ";
				oStore = yield my.cadesplugin.CreateObjectAsync("CAdESCOM.Store");
				if (!oStore) throw "Объект или свойство не найдено. (0x80092004)";
				yield oStore.Open();

				stage_message = "Ошибка при получении коллекции сертификатов: ";
				let certs:any = yield oStore.Certificates;
				if (!certs) throw "Объект или свойство не найдено. (0x80092004)";

				stage_message = "Ошибка при определении количества сертификатов: ";
				let certCnt:any = yield certs.Count;
				if (certCnt === null) throw "Объект или свойство не найдено. (0x80092004)";

				// Если сертификатов нет, то дальше делать нечего
				if (certCnt === 0) return;

				for (var i = 1; i <= certCnt; i++)
				{
					stage_message = "Ошибка при перечислении сертификатов: ";
					let cert:any = yield certs.Item(i);

					stage_message = "Ошибка при получении свойств сертификата: ";
					let PublicKeyAlgorithm = yield (yield cert.PublicKey()).Algorithm;

					let thumbprint: string = yield cert.Thumbprint;

					if (my.onCertificateAdd)
					my.onCertificateAdd(new webSignCertificate(
						my.libraryName + '|' + deviceName + '|' + thumbprint,
						yield cert.Export(my.cadesplugin.CADESCOM_ENCODE_BASE64),
						thumbprint,
						new Date(yield cert.ValidFromDate),
						new Date(yield cert.ValidToDate),
						yield cert.SubjectName,
						yield cert.IssuerName,
						yield cert.HasPrivateKey(),
						yield PublicKeyAlgorithm.FriendlyName,
						yield PublicKeyAlgorithm.Value
					));
				}
			}
			catch (ex)
			{
				if (my.onError) my.onError(new webSignError('1003', stage_message, ex));
			}
			finally
			{
				if (oStore) yield oStore.Close();
			}
		});
	}

	public stopCertificateScan()
	{
	}

	public signHash(certificate: webSignCertificate, algorithmOid: string, hashAsHex: string)
	{
		// save result
		if (this.onSignComplete) this.onSignComplete(new webSignSignature(certificate, algorithmOid, hashAsHex, "Signature cp"));
	}
}
