export class webSignCommon
{
	
}

export class webSignCertificate
{
	public id: string;
	public bodyBase64: string;
	constructor(_id: string, _bodyBase64: string)
	{
		this.id = _id;
		this.bodyBase64 = _bodyBase64;
	}
}

export class webSignError
{

}

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

export { webSignInterface } from './webSignInterface';
