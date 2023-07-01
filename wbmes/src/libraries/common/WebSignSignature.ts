import { IWebSignCertificate } from './IWebSignCertificate';
import { IWebSignSignature } from './IWebSignSignature';

export class WebSignSignature implements IWebSignSignature
{
	public Certificate: IWebSignCertificate;
	public AlgorithmOid: string;
	public HashAsHex: string;
	public SignatureBase64: string;

	constructor(certificate: IWebSignCertificate, algorithmOid: string, hashAsHex: string, signatureBase64: string)
	{
		this.Certificate = certificate;
		this.AlgorithmOid = algorithmOid;
		this.HashAsHex = hashAsHex;
		this.SignatureBase64 = signatureBase64;
	}
}
