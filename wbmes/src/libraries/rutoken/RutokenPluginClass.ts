import { RutokenDeviceEvents } from './RutokenDeviceEvents';
import { RutokenEnumerateDevicesOptions } from './RutokenEnumerateDevicesOptions';

export interface RutokenPluginClass extends Promise<void>
{
	version: string;
	enumerateDevices(options: RutokenEnumerateDevicesOptions): Promise<RutokenDeviceEvents>;
	enumerateCertificates(device: number, certCategory: number);
	getCertificate(device: number, thumbprint: string): Promise<string>;
	parseCertificate(device: number, thumbprint: string);
	ENUMERATE_DEVICES_EVENTS: number;
	CERT_CATEGORY_USER: number;
}
