import { IVersion } from './IVersion';

/** https://cpdn.cryptopro.ru/content/cades/interface_c_ad_e_s_c_o_m_1_1_i_about3.html */
export interface IAbout3
{
	PluginVersion: IVersion;
	CSPVersion(name: string, num: number): IVersion;
	CSPName(num: number): string;
}
