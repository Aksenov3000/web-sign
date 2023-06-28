// include libraries
import { webSignCertificate, webSignCommon, webSignError, webSignSignature, webSignInterface } from '../common/index';
import * as RutokenPluginApiDummy from './rutoken-plugin';
import { rutokenPluginInfo } from './rutokenPluginInfo';

// main class
export default class webSignRutoken implements webSignInterface
{
	// certificate list.
	private certificateList = new Map<string, webSignCertificate>();
	private common = new webSignCommon();
	public TRUE: boolean;
	public FALSE: boolean;

	private rutokenplugin: any;
	private pluginInfo: rutokenPluginInfo = new rutokenPluginInfo();

	private interval1: ReturnType<typeof setInterval> | number = 0;
	private interval2: ReturnType<typeof setInterval> | number = 0;

	public onCertificateAdd?: (certificate: webSignCertificate) => void;
	public onCertificateRemove?: (certificate: webSignCertificate) => void;
	public onError?: (error: webSignError) => void;
	public onSignComplete?: (error: webSignSignature) => void;

	public libraryName: string = "Rutoken";

	public v: any = RutokenPluginApiDummy;

	constructor()
	{
		this.TRUE = RutokenPluginApiDummy.tr(1);
		this.FALSE = RutokenPluginApiDummy.fa(1);

		this.rutokenplugin = (window as any).rutoken;

		let my = this;
		(window as any).onload = function ()
		{
			if (!my.rutokenplugin)
			{
				if (my.onError) my.onError(new webSignError('1000', 'Плагин не найден', null));
				return;

			}

			my.rutokenplugin.ready.then(function () {
				const isFirefox = !!(window as any).navigator.userAgent.match(/firefox/i) && !(window as any).navigator.userAgent.match(/seamonkey/i);

				if ((window as any).chrome || isFirefox) {
					return my.rutokenplugin.isExtensionInstalled();
				} else {
					return Promise.resolve(true);
				}
			}).then(function (result) {
				if (result) {
					return my.rutokenplugin.isPluginInstalled();
				} else {
					throw "Rutoken Extension wasn't found";
				}
			}).then(function (result) {
				if (result) {
					return my.rutokenplugin.loadPlugin();
				} else {
					throw "Rutoken Plugin wasn't found";
				}
			}).then(function (plugin) {
				//Можно начинать работать с плагином
				console.log(plugin);
			}).then(undefined, function (reason) {
				console.log(reason);
				if (my.onError) my.onError(new webSignError('1001', 'Плагин не загружен - ' + reason, null));
			});
		};

	}

	public startCertificateScan()
	{
		this.interval1 = setInterval(() =>
		{
			//if (this.onCertificateAdd) this.onCertificateAdd(new webSignCertificate("id ru", "cert"));
		}, 5000);

		this.interval2 = setInterval(() =>
		{
			//if (this.onCertificateRemove) this.onCertificateRemove(new webSignCertificate("id ru", "cert"));
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
		if (this.onSignComplete) this.onSignComplete(new webSignSignature(certificate, algorithmOid, hashAsHex, "Signature ru"));
	}
}
