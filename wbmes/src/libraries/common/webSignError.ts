export class webSignError
{
	public code: string;
	public message: string;
	public exception: any;
	constructor(code: string, message: string, exception: any)
	{
		this.code = code;
		this.message = message;
		this.exception = exception;
	}
}
