import { IWebSignCertificate } from './IWebSignCertificate';

export class WebSignCertificate implements IWebSignCertificate
{
	public id: string;
	public bodyBase64: string;

	constructor(
		id: string,
		bodyBase64: string,
		thumbprint: string,
		validFromDate: Date,
		validToDate: Date,
		subjectName: string,
		issuerName: string,
		hasPrivateKey: boolean,
		publicKey_Algorithm_FriendlyName: string,
		publicKey_Algorithm_OID: string)
	{
		this.id = id;
		this.bodyBase64 = bodyBase64;
		this.thumbprint = thumbprint;
		this.validFromDate = validFromDate;
		this.validToDate = validToDate;
		this.subjectName = subjectName;
		this.issuerName = issuerName;
		this.hasPrivateKey = hasPrivateKey;
		this.publicKey_Algorithm_FriendlyName = publicKey_Algorithm_FriendlyName;
		this.publicKey_Algorithm_OID = publicKey_Algorithm_OID;
	}

	public thumbprint: string;
	public validFromDate: Date;
	public validToDate: Date;
	public subjectName: string;
	public issuerName: string;
	public hasPrivateKey: boolean;
	public publicKey_Algorithm_FriendlyName: string;
	public publicKey_Algorithm_OID: string;
}
