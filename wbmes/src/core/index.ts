import { webSignCertificate, webSignError, webSignSignature, webSignInterface } from '../libraries/common/index';
import webSignCryptoPro from '../libraries/cryptopro/index';
import webSignRutoken from '../libraries/rutoken/index';

/** Main web sign class */
export default class webSign
{
	/** Internal list of available certificates */
	private certificateList = new Map<string, webSignCertificate>();

	/** Internal list of modules */
	private libraryInstances = new Set<webSignInterface>();

	/** 
		*  Event. New certificate is available
		* @remarks 
		* This event occurs when modules found new available certificate for sign.
	  * Works after call to startCertificateScan.
		*
		* @param certificate Information about new certificate
	*/
	public onCertificateAdd?: (certificate: webSignCertificate) => void;

	/**
		*  Event. Certificate is now unavailable.
		*
		* @remarks
		* This event occurs when modules detect certificate removal.
	  * Works after call to startCertificateScan.
		*
		* @param certificate Information about removed certificate
	*/
	public onCertificateRemove?: (certificate: webSignCertificate) => void;

	/**
		*  Event. Common error in any function.
		*
		* @remarks
		* This event occurs when any error occurs.
		*
		* @param certificate Information about error
	*/
	public onError?: (error: webSignError) => void;

	/**
		*  Event. Sign is completed.
		*
		* @remarks
		* This event occurs when sign hash completes and produce signature.
		*
		* @param certificate Information about signature
	*/
	public onSignComplete?: (signature: webSignSignature) => void;

	/** Constructor creates objects for all modules and subscribe for all its events. */
	constructor()
	{
		// register CryptoPro
		const cp = new webSignCryptoPro();
		cp.onCertificateAdd = (certificate: webSignCertificate) =>
		{
			this.certificateList.set(certificate.id, certificate);
			if (this.onCertificateAdd) this.onCertificateAdd(certificate);
		};
		cp.onCertificateRemove = (certificate: webSignCertificate) =>
		{
			this.certificateList.delete(certificate.id);
			if (this.onCertificateRemove) this.onCertificateRemove(certificate);
		};
		cp.onError = (error: webSignError) =>
		{
			if (this.onError) this.onError(error);
		};
		cp.onSignComplete = (signature: webSignSignature) =>
		{
			if (this.onSignComplete) this.onSignComplete(signature);
		};
		this.libraryInstances.add(cp);

		// register Rutoken
		const rt = new webSignRutoken();
		rt.onCertificateAdd = (certificate: webSignCertificate) =>
		{
			this.certificateList.set(certificate.id, certificate);
			if (this.onCertificateAdd) this.onCertificateAdd(certificate);
		};
		rt.onCertificateRemove = (certificate: webSignCertificate) =>
		{
			this.certificateList.delete(certificate.id);
			if (this.onCertificateRemove) this.onCertificateRemove(certificate);
		};
		rt.onError = (error: webSignError) =>
		{
			if (this.onError) this.onError(error);
		};
		rt.onSignComplete = (signature: webSignSignature) =>
		{
			if (this.onSignComplete) this.onSignComplete(signature);
		};
		this.libraryInstances.add(rt);
	}

	/** Start searching for available certificates. */
	public startCertificateScan():void
	{
		// subsequently start searching in all modules
		this.libraryInstances.forEach((ws) => ws.startCertificateScan());
	}

	/** Stop searching for available certificates. */
	public stopCertificateScan(): void
	{
		// subsequently stop searching in all modules
		this.libraryInstances.forEach((ws) => ws.stopCertificateScan());
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
	public signHash(certificate: webSignCertificate, algorithmOid: string, hashAsHex: string): void
	{
		// save result
		if (this.onSignComplete) this.onSignComplete(new webSignSignature(certificate, algorithmOid, hashAsHex, 'Signature core'));
	}
}

//let t = new webSign();
//t.onCertificateAdd = (certificate: webSignCertificate) =>
//{
//	console.log("add " + certificate.id);

//};
//t.onCertificateRemove = (certificate: webSignCertificate) =>
//{
//	console.log("remove " + certificate.id);
//};
//t.startCertificateScan();


