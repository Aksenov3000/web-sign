import { IWebSignCertificate } from './IWebSignCertificate';

export interface IWebSignSignature
{
	Certificate: IWebSignCertificate;
	AlgorithmOid: string;
	HashAsHex: string;
	SignatureBase64: string;
}
