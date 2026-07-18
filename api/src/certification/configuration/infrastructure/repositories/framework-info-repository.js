import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../shared/domain/models/Scopes.js';
import { FrameworkInfo } from '../../domain/read-models/FrameworkInfo.js';
import { VersionSummary } from '../../domain/read-models/VersionSummary.js';

export async function findAll() {
  const knexConn = DomainTransaction.getConnection();
  const allData = await knexConn
    .from('certification_versions')
    .select({
      scope: 'certification_versions.scope',
      id: 'certification_versions.id',
      startDate: 'certification_versions.startDate',
      expirationDate: 'certification_versions.expirationDate',
      status: 'certification_versions.status',
      assessmentDuration: 'certification_versions.assessmentDuration',
      maximumAssessmentLength: knexConn.raw(
        'certification_versions."challengesConfiguration"->\'maximumAssessmentLength\'',
      ),
    })
    .orderBy('id');

  const allFrameworksInfo = [];
  const cleaFrameworkInfo = new FrameworkInfo({ id: Frameworks.CLEA, scope: Frameworks.CLEA, versionSummaries: [] });
  allFrameworksInfo.push(cleaFrameworkInfo);
  for (const scope of Object.values(SCOPES)) {
    const versionsData = allData.filter((dataItem) => dataItem.scope === scope);
    const versionSummaries = versionsData.map((versionData) => new VersionSummary(versionData));
    allFrameworksInfo.push(new FrameworkInfo({ id: scope, scope, versionSummaries }));
  }

  return allFrameworksInfo;
}
