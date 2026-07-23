import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../shared/domain/models/Scopes.js';
import { FrameworkInfo } from '../../domain/read-models/FrameworkInfo.js';
import { VersionSummary } from '../../domain/read-models/VersionSummary.js';

export async function findAll() {
  const allData = await baseQuery().orderBy('id');

  const allFrameworksInfo = [];
  allFrameworksInfo.push(buildCleaFrameworkInfo());
  for (const scope of Object.values(SCOPES)) {
    const versionsData = allData.filter((dataItem) => dataItem.scope === scope);
    const versionSummaries = versionsData.map((versionData) => new VersionSummary(versionData));
    allFrameworksInfo.push(new FrameworkInfo({ id: scope, scope, versionSummaries }));
  }

  return allFrameworksInfo;
}

export async function find(frameworkName) {
  if (frameworkName === Frameworks.CLEA) {
    return buildCleaFrameworkInfo();
  }
  const versionsData = await baseQuery().where('certification_versions.scope', frameworkName);
  if (versionsData.length === 0) {
    return null;
  }
  const versionSummaries = versionsData.map((versionData) => new VersionSummary(versionData));
  return new FrameworkInfo({ id: frameworkName, scope: frameworkName, versionSummaries });
}

function baseQuery() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn.from('certification_versions').select({
    scope: 'certification_versions.scope',
    id: 'certification_versions.id',
    startDate: 'certification_versions.startDate',
    expirationDate: 'certification_versions.expirationDate',
    status: 'certification_versions.status',
    assessmentDuration: 'certification_versions.assessmentDuration',
    maximumAssessmentLength: knexConn.raw(
      'certification_versions."challengesConfiguration"->\'maximumAssessmentLength\'',
    ),
  });
}

function buildCleaFrameworkInfo() {
  return new FrameworkInfo({ id: Frameworks.CLEA, scope: Frameworks.CLEA, versionSummaries: [] });
}
