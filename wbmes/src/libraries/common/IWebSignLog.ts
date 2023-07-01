import { WebSignLogEnum } from './WebSignLogEnum';
import { WebSignLogLevelEnum } from './WebSignLogLevelEnum';

export interface IWebSignLog
{
	Library: string;
	Level: WebSignLogLevelEnum;
	Code: WebSignLogEnum;
	Exception;
}
