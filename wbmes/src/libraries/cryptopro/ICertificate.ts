export interface ICertificate
{
	Export;
	Import;
	GetInfo;
	HasPrivateKey;
	IsValid;
	IssuerName;
	SerialNumber;
	SubjectName;
	Thumbprint;
	ValidFromDate;
	ValidToDate;
	Version;
	ExtendedKeyUsage;
	KeyUsage;
	PublicKey;
	PrivateKey;
	BasicConstraints;
}
