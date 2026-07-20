import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { toScope } from '../../../shared/domain/models/Frameworks.js';
import { CertificationInfo } from '../../domain/read-models/CertificationInfo.js';

export async function findAllByFramework(framework) {
  const knexConn = DomainTransaction.getConnection();
  const scope = toScope(framework);
  const rawResults = await knexConn('certification_versions')
    .select([
      'challengesConfiguration',
      'status',
      'assessmentDuration',
      'minimumAnswersRequiredToValidateACertification',
    ])
    .where({ scope })
    .orderBy('id', 'asc');

  return rawResults.map((rawResult) => {
    return new CertificationInfo({
      framework,
      status: rawResult.status,
      assessmentDuration: rawResult.assessmentDuration,
      minimumAssessmentLength: rawResult.minimumAnswersRequiredToValidateACertification,
      maximumAssessmentLength: rawResult.challengesConfiguration.maximumAssessmentLength,
    });
  });
}
