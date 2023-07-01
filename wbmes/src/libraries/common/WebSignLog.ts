import { IWebSignLog } from './IWebSignLog';
import { WebSignLogEnum } from './WebSignLogEnum';
import { WebSignLogLevelEnum } from './WebSignLogLevelEnum';

export class WebSignLog implements IWebSignLog
{
	public Library: string;
	public Level: WebSignLogLevelEnum;
	public Code: WebSignLogEnum;
	public Exception;
	constructor(library: string, level: WebSignLogLevelEnum, code: WebSignLogEnum, exception?)
	{
		this.Library = library;
		this.Level = level;
		this.Code = code;
		this.Exception = exception;
	}
}