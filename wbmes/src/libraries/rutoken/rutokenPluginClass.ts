import { rutokenDeviceEvents } from './rutokenDeviceEvents';
import { rutokenEnumerateDevicesOptions } from './rutokenEnumerateDevicesOptions';

export interface rutokenPluginClass extends Promise<void>
{
	version: string;
	enumerateDevices(options: rutokenEnumerateDevicesOptions): Promise<rutokenDeviceEvents>;
	ENUMERATE_DEVICES_EVENTS: number;
}
