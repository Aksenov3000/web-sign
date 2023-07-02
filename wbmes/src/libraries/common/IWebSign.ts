import { ISimpleEvent } from 'ste-simple-events';
import { IWebSignCertificate } from './IWebSignCertificate';
import { IWebSignLog } from './IWebSignLog';
import { IWebSignSignature } from './IWebSignSignature';

export interface IWebSign
{
	/** 
		*  Event. New certificate is available
		* @remarks 
		* This event occurs when modules found new available certificate for sign.
		* Works after call to startCertificateScan.
	*/
	get OnCertificateAdd(): ISimpleEvent<IWebSignCertificate>;

	/**
		*  Event. Certificate is now unavailable.
		*
		* @remarks
		* This event occurs when modules detect certificate removal.
		* Works after call to startCertificateScan.
	*/
	get OnCertificateRemove(): ISimpleEvent<IWebSignCertificate>;

	/**
		*  Event. Common loger transport.
		*
		* @remarks
		* This event occurs when any log occurs.
	*/
	get OnLog(): ISimpleEvent<IWebSignLog>;

	/** Promise. Call this to strart working with this class */
	get Ready(): Promise<void>;

	/** Start searching for available certificates. */
	StartCertificateScan(): void;

	/** Stop searching for available certificates. */
	StopCertificateScan(): void;

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
	SignHash(certificate: IWebSignCertificate, algorithmOid: string, hashAsHex: string): Promise<IWebSignSignature>;

	/** Internal library name */
	LibraryName: string;
}
