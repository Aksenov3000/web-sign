export class webSignCertificate
{
	public id: string;
	public bodyBase64: string;
	constructor(_id: string, _bodyBase64: string)
	{
		this.id = _id;
		this.bodyBase64 = _bodyBase64;
	}
}
