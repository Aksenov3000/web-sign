import { webSignCertificate, webSignError, webSignSignature } from '../common/';

export interface webSignInterface
{
	onCertificateAdd?: (certificate: webSignCertificate) => void;
	onCertificateRemove?: (certificate: webSignCertificate) => void;
	onError?: (error: webSignError) => void;
	onSignComplete?: (error: webSignSignature) => void;

	startCertificateScan(): void;

	stopCertificateScan(): void;

	signHash(certificate: webSignCertificate, algorithmOid: string, hashAsHex: string): void;
}
