import { SimpleEventDispatcher } from 'ste-simple-events';
import { IWebSign, IWebSignLog } from '../libraries/common/index';
import { IWebSignCertificate } from '../libraries/common/IWebSignCertificate';
import { IWebSignSignature } from '../libraries/common/IWebSignSignature';
import { WebSignSignature } from '../libraries/common/WebSignSignature';
import { WebSignCryptoPro }  from '../libraries/cryptopro/index';
import { WebSignRutoken }  from '../libraries/rutoken/index';

/** Main web sign class */
export default class WebSign
{
	/** Internal list of available certificates */
	private CertificateList = new Map<string, IWebSignCertificate>();

	/** Internal list of modules */
	private LibraryInstances = new Set<IWebSign>();

	/** Internal event on Certificate Add */
	private _OnCertificateAdd = new SimpleEventDispatcher<IWebSignCertificate>();

	/** Internal event on Certificate Remove */
	private _OnCertificateRemove = new SimpleEventDispatcher<IWebSignCertificate>();

	/** Internal event on Error */
	private _OnLog = new SimpleEventDispatcher<IWebSignLog>();

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

	/** Constructor creates objects for all modules and subscribe for all its events. */
	constructor()
	{
		// register CryptoPro
		const cp = new WebSignCryptoPro();
		cp.OnCertificateAdd.subscribe((certificate) =>
		{
			this.CertificateList.set(certificate.Id, certificate);
			this._OnCertificateAdd.dispatch(certificate);
		});
		cp.OnCertificateRemove.subscribe((certificate) =>
		{
			this.CertificateList.delete(certificate.Id);
			this._OnCertificateRemove.dispatch(certificate);
		});
		cp.OnLog.subscribe((error) => this._OnLog.dispatch(error));

		cp.Ready.then(() =>
		{
			alert('ready cp');
		})
			.catch((ex) =>
			{
				alert('not ready cp');
			});
		this.LibraryInstances.add(cp);

		// register Rutoken
		const rt = new WebSignRutoken();
		rt.OnCertificateAdd.subscribe((certificate) =>
		{
			this.CertificateList.set(certificate.Id, certificate);
			this._OnCertificateAdd.dispatch(certificate);
		});
		rt.OnCertificateRemove.subscribe((certificate) =>
		{
			this.CertificateList.delete(certificate.Id);
			this._OnCertificateRemove.dispatch(certificate);
		});
		rt.OnLog.subscribe((error) =>
		{
			this._OnLog.dispatch(error);
		});
		rt.Ready.then(() =>
		{
			alert('ready rt');
		})
			.catch((ex) =>
			{
				alert('not ready rt');
			});

		this.LibraryInstances.add(rt);
	}

	/** Start searching for available certificates. */
	public startCertificateScan():void
	{
		// subsequently start searching in all modules
		this.LibraryInstances.forEach((ws) => ws.StartCertificateScan());
	}

	/** Stop searching for available certificates. */
	public stopCertificateScan(): void
	{
		// subsequently stop searching in all modules
		this.LibraryInstances.forEach((ws) => ws.StopCertificateScan());
	}

	/**
		* Sign hash with certificate
		*
		* @remarks
		* Sign hash using provided certificate and hash algorithm
		*
		* @param certificate Certificate to sign
		* @param algorithmOid Object identifier of hashing algorithm
		* @example
		* 1.2.643.7.1.1.2.2 - GOST R 34.11-12 with length 256
		* 1.2.643.7.1.1.2.3 - GOST R 34.11-12 with length 512
	  * 2.16.840.1.101.3.4.2.1 - Secure Hash Algorithm that uses a 256 bit key (SHA256)
		* @param hashAsHex Hex string of bytes of hash value
		* @example
		* for oid 1.2.643.7.1.1.2.2 - 00557be5e584fd52a449b16b0251d05d27f94ab76cbaa6da890b59d8ef1e159d
		*/
	public signHash(certificate: IWebSignCertificate, algorithmOid: string, hashAsHex: string): Promise<IWebSignSignature>
	{
		return new Promise<IWebSignSignature>((resolve, reject) =>
		{
			if (!this.CertificateList) reject('dummy error');
			resolve(new WebSignSignature(certificate, algorithmOid, hashAsHex, 'Signature core'));
			return;
		});
	}
}
