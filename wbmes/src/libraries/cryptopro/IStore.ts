import { ICertificates } from './ICertificates';

export interface IStore
{
	Open();
	Close();
	Certificates:ICertificates;
}
