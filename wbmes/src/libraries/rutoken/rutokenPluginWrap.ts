import { rutokenPluginClass } from './rutokenPluginClass';

export interface rutokenPluginWrap
{
	ready: Promise<void>;
	isExtensionInstalled(): Promise<boolean>;
	isPluginInstalled(): Promise<boolean>;
	loadPlugin(): Promise<rutokenPluginClass>;
}
