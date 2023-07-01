import { WebSignLogEnum } from './WebSignLogEnum';

export class WebSignLogMessages
{
	public Language: Map<string, Map<WebSignLogEnum, string>> = new Map(
		[
			['ru', new Map(
				[
					[WebSignLogEnum.PluginNotFound, '������ �� ������'],
					[WebSignLogEnum.CreatePluginObject, '������� ������ �������'],
					[WebSignLogEnum.GetPluginVersion, '�������� ������ �������'],
					[WebSignLogEnum.GetCSPVersion, '�������� ������ CSP'],
					[WebSignLogEnum.UnexpectedException, '�������������� ������'],
					[WebSignLogEnum.LoadPluginObject, '�������� ������� �������'],
					[WebSignLogEnum.OpenCertificateStore, '��������� ��������� ������������'],
					[WebSignLogEnum.GetCertificateListFromStore, '�������� ��������� ������������ �� ���������'],
					[WebSignLogEnum.GetCertificateCountFromStore, '�������� ������ ��������� ������������ �� ���������'],
					[WebSignLogEnum.EnumCertificatesInStore, '����������� ��������� ������������ �� ���������'],
					[WebSignLogEnum.GetCertificateFromStore, '�������� ���������� �� ���������'],
					[WebSignLogEnum.EnumDevices, '����������� ����������'],
					[WebSignLogEnum.EnumCertificatesInDevice, '����������� ��������� ������������ �� ����������'],
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
