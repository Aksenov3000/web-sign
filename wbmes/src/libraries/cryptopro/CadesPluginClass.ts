export interface CadesPluginClass extends Promise<void>
{
	async_spawn(generatorFunc): void;
	CreateObjectAsync(name: string);

	CADESCOM_ENCODE_BASE64:number;
	CADESCOM_ENCODE_BINARY: number;
	CADESCOM_ENCODE_ANY: number;
}
