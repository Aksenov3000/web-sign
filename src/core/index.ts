// include libraries
import { webSignCertificate, webSignError, webSignSignature, webSignInterface } from '../libraries/common/';
import webSignCryptoPro from '../libraries/cryptopro/';
import webSignRutoken from '../libraries/rutoken/';

// main class
export default class webSign
{
	// certificate list.
	private certificateList = new Map<string, webSignCertificate>();

	// library instaces.
	private libraryInstances = new Set<webSignInterface>();

	public onCertificateAdd?: (certificate:webSignCertificate) => void;
	public onCertificateRemove?: (certificate: webSignCertificate) => void;
	public onError?: (error: webSignError) => void;
	public onSignComplete?: (error: webSignSignature) => void;

	constructor()
	{
		// register libraries
		let cp = new webSignCryptoPro();
		cp.onCertificateAdd = (certificate: webSignCertificate) =>
		{
			this.certificateList.set(certificate.id, certificate);
			if (this.onCertificateAdd) this.onCertificateAdd(certificate);
		}
		this.libraryInstances.add(cp);

		let rt = new webSignRutoken();
		rt.onCertificateAdd = (certificate: webSignCertificate) =>
		{
			this.certificateList.set(certificate.id, certificate);
			if (this.onCertificateAdd) this.onCertificateAdd(certificate);
		}
		this.libraryInstances.add(rt);
	}

	public startCertificateScan()
	{
		this.libraryInstances.forEach((ws) => ws.startCertificateScan());
	}

	public stopCertificateScan()
	{
		this.libraryInstances.forEach((ws) => ws.stopCertificateScan());
	}

	public signHash(certificate: webSignCertificate, algorithmOid: string, hashAsHex: string)
	{
		// save result
		if (this.onSignComplete) this.onSignComplete(new webSignSignature(certificate, algorithmOid, hashAsHex, "Signature core"));
	}
}

let t = new webSign();
t.onCertificateAdd = (certificate: webSignCertificate) =>
{
	console.log("add " + certificate.id);

};
t.onCertificateRemove = (certificate: webSignCertificate) =>
{
	console.log("remove " + certificate.id);
};
t.startCertificateScan();


