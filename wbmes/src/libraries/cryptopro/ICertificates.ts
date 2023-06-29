import { ICertificate } from './ICertificate';

export interface ICertificates
{
	Find(FindType, varCriteria, bFindValidOnly): ICertificates;

	Item(Index: number): ICertificate;

	Count: number;
}
