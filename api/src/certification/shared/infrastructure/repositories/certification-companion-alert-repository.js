import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCompanionLiveAlert } from '../../domain/models/CertificationCompanionLiveAlert.js';

const TABLE_NAME = 'certification-companion-live-alerts';

export async function create({ assessmentId, status }, { knex = DomainTransaction.getConnection() } = {}) {
  // Lock assessment in order to guarantee consistency
  // between select and insert on certification-companion-live-alerts
  await knex.select().from('assessments').where('id', '=', assessmentId).forUpdate();

  const { count } = await knex.count().from(TABLE_NAME).where({ assessmentId, status }).first();
  if (count > 0) return;

  await knex(TABLE_NAME).insert({ assessmentId, status });
}

export const getAllByAssessmentId = async ({ assessmentId }) => {
  const knexConn = DomainTransaction.getConnection();
  const certificationCompanionLiveAlertsDto = await knexConn(TABLE_NAME).select('id', 'assessmentId', 'status').where({
    assessmentId,
  });

  return certificationCompanionLiveAlertsDto.map(_toDomain);
};

const _toDomain = (certificationCompanionLiveAlertDto) => {
  return new CertificationCompanionLiveAlert(certificationCompanionLiveAlertDto);
};
