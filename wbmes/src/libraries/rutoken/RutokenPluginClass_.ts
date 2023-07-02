import { rutokenDeviceEvents } from './rutokenDeviceEvents';
import { rutokenEnumerateDevicesOptions } from './rutokenEnumerateDevicesOptions';

export interface RutokenPluginClass extends Promise<void>
{
	version: string;
	enumerateDevices(options: rutokenEnumerateDevicesOptions): Promise<rutokenDeviceEvents>;
	ENUMERATE_DEVICES_EVENTS: number;
}
