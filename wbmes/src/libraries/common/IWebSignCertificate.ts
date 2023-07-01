export interface IWebSignCertificate
{
	id: string;
	bodyBase64: string;
	thumbprint: string;
	validFromDate: Date;
	validToDate: Date;
	subjectName: string;
	issuerName: string;
	hasPrivateKey: boolean;
	publicKey_Algorithm_FriendlyName: string;
	publicKey_Algorithm_OID: string;
}
