// include libraries
import { webSignCertificate, webSignError, webSignSignature, webSignInterface } from '../common/index';
//import * as CadesPluginApiDummy from './cadesplugin_api';
// main class
export default class webSignCryptoPro implements webSignInterface
{
	// certificate list.
	//private certificateList = new Map<string, webSignCertificate>();
	//private common = new webSignCommon();

	private interval1: ReturnType<typeof setInterval> | number = 0;
	private interval2: ReturnType<typeof setInterval> | number = 0;
	//private a: boolean = CadesPluginApiDummy.a(1);

	public onCertificateAdd?: (certificate: webSignCertificate) => void;
	public onCertificateRemove?: (certificate: webSignCertificate) => void;
	public onError?: (error: webSignError) => void;
	public onSignComplete?: (error: webSignSignature) => void;

	constructor()
	{
		//let atrue:boolean = this.a;
	}

	public startCertificateScan()
	{
		this.interval1 = setInterval(() =>
		{
			if (this.onCertificateAdd) this.onCertificateAdd(new webSignCertificate("id cp", "cert"));
		}, 5000);

		this.interval2 = setInterval(() =>
		{
			if (this.onCertificateRemove) this.onCertificateRemove(new webSignCertificate("id cp", "cert"));
		}, 10000);
	}

	public stopCertificateScan()
	{
		clearInterval(this.interval1);
		clearInterval(this.interval2);
	}

	public signHash(certificate: webSignCertificate, algorithmOid: string, hashAsHex: string)
	{
		// save result
		if (this.onSignComplete) this.onSignComplete(new webSignSignature(certificate, algorithmOid, hashAsHex, "Signature cp"));
	}
}
