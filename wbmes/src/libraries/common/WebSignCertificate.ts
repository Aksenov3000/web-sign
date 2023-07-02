import { IWebSignCertificate } from './IWebSignCertificate';

export class WebSignCertificate implements IWebSignCertificate
{
	public Id: string;
	public Library: string;
	public Device: string;
	public BodyBase64: string;
	public Thumbprint: string;
	public ValidFromDate: Date;
	public ValidToDate: Date;
	public SubjectName: string;
	public IssuerName: string;
	public HasPrivateKey: boolean;
	public PublicKey_Algorithm_FriendlyName: string;
	public PublicKey_Algorithm_OID: string;

	constructor(
		id: string,
		library: string,
		device: string,
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
		this.Id = id;
		this.Library = library;
		this.Device = device;
		this.BodyBase64 = bodyBase64;
		this.Thumbprint = thumbprint;
		this.ValidFromDate = validFromDate;
		this.ValidToDate = validToDate;
		this.SubjectName = subjectName;
		this.IssuerName = issuerName;
		this.HasPrivateKey = hasPrivateKey;
		this.PublicKey_Algorithm_FriendlyName = publicKey_Algorithm_FriendlyName;
		this.PublicKey_Algorithm_OID = publicKey_Algorithm_OID;
	}
}
