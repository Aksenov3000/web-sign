export interface IWebSignCertificate
{
	Id: string;
	Library: string;
	Device: string;
	BodyBase64: string;
	Thumbprint: string;
	ValidFromDate: Date;
	ValidToDate: Date;
	SubjectName: string;
	IssuerName: string;
	HasPrivateKey: boolean;
	PublicKey_Algorithm_FriendlyName: string;
	PublicKey_Algorithm_OID: string;
}
