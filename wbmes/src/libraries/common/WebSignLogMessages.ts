import { WebSignLogEnum } from './WebSignLogEnum';

export class WebSignLogMessages
{
	public Language: Map<string, Map<WebSignLogEnum, string>> = new Map(
		[
			['ru', new Map(
				[
					[WebSignLogEnum.PluginNotFound, 'Плагин не найден'],
					[WebSignLogEnum.CreatePluginObject, 'Создаем объект плагина'],
					[WebSignLogEnum.GetPluginVersion, 'Получаем версию плагина'],
					[WebSignLogEnum.GetCSPVersion, 'Получаем версию CSP'],
					[WebSignLogEnum.UnexpectedException, 'Непредвиденная ошибка'],
					[WebSignLogEnum.LoadPluginObject, 'Загрузка объекта плагина'],
					[WebSignLogEnum.OpenCertificateStore, 'Открываем хранилище сертификатов'],
					[WebSignLogEnum.GetCertificateListFromStore, 'Получаем коллекцию сертификатов из хранилища'],
					[WebSignLogEnum.GetCertificateCountFromStore, 'Получаем размер коллекции сертификатов из хранилища'],
					[WebSignLogEnum.EnumCertificatesInStore, 'Перечисляем коллекцию сертификатов из хранилища'],
					[WebSignLogEnum.GetCertificateFromStore, 'Получаем сертификат из хранилища'],
					[WebSignLogEnum.EnumDevices, 'Перечисляем устройства'],
					[WebSignLogEnum.EnumCertificatesInDevice, 'Перечисляем коллекцию сертификатов из устройства'],
				])],
			['en', new Map(
				[
					[WebSignLogEnum.PluginNotFound, 'Plugin not found'],
					[WebSignLogEnum.CreatePluginObject, 'Create Plugin Object'],
					[WebSignLogEnum.GetPluginVersion, 'Get Plugin Version'],
					[WebSignLogEnum.GetCSPVersion, 'Get CSP Version'],
					[WebSignLogEnum.UnexpectedException, 'Unexpected Exception'],
					[WebSignLogEnum.LoadPluginObject, 'Load Plugin Object'],
					[WebSignLogEnum.OpenCertificateStore, 'Open Certificate Store'],
					[WebSignLogEnum.GetCertificateListFromStore, 'Get Certificate List FromStore'],
					[WebSignLogEnum.GetCertificateCountFromStore, 'Get Certificate Count FromStore'],
					[WebSignLogEnum.EnumCertificatesInStore, 'Enum Certificates In Store'],
					[WebSignLogEnum.GetCertificateFromStore, 'Get One Certificate From Store'],
					[WebSignLogEnum.EnumDevices, 'Enum Devices'],
					[WebSignLogEnum.EnumCertificatesInDevice, 'Enum Certificates In device'],
				])],
		]);
}
