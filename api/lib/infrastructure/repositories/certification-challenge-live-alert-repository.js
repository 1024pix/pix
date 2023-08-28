import { DomainTransaction } from '../DomainTransaction.js';
import { knex } from '../../../db/knex-database-connection.js';
import { CertificationChallengeLiveAlert } from '../../domain/models/index.js';

const save = async function ({
  certificationChallengeLiveAlert,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction || knex;
  return knexConn('certification-challenge-live-alerts').insert(certificationChallengeLiveAlert);
};

const getByAssessmentId = async (assessmentId) => {
  const certificationChallengeLiveAlertsDto = await knex('certification-challenge-live-alerts').where({
    assessmentId,
  });

  return certificationChallengeLiveAlertsDto.map(_toDomain);
};

const _toDomain = (certificationChallengeLiveAlertDto) =>
  new CertificationChallengeLiveAlert(certificationChallengeLiveAlertDto);

export { save, getByAssessmentId };
