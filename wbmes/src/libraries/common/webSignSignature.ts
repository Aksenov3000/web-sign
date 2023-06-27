import { webSignCertificate } from './webSignCertificate';

export class webSignSignature
{
	public certificate: webSignCertificate;
	public algorithmOid: string;
	public hashAsHex: string;
	public signatureBase64: string;

	constructor(_certificate: webSignCertificate, _algorithmOid: string, _hashAsHex: string, _signatureBase64: string)
	{
		this.certificate = _certificate;
		this.algorithmOid = _algorithmOid;
		this.hashAsHex = _hashAsHex;
		this.signatureBase64 = _signatureBase64;
	}
}
