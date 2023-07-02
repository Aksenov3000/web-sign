import { RutokenPluginClass } from './RutokenPluginClass';

export interface RutokenPluginWrap
{
	ready: Promise<void>;
	isExtensionInstalled(): Promise<boolean>;
	isPluginInstalled(): Promise<boolean>;
	loadPlugin(): Promise<RutokenPluginClass>;
}
