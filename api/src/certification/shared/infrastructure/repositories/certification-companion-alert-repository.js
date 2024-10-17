import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationCompanionLiveAlert } from '../../domain/models/CertificationCompanionLiveAlert.js';

export const getAllByAssessmentId = async ({ assessmentId }) => {
  const certificationCompanionLiveAlertsDto = await knex('certification-companion-live-alerts')
    .select('id', 'assessmentId', 'status')
    .where({
      assessmentId,
    });

  return certificationCompanionLiveAlertsDto.map(_toDomain);
};

const _toDomain = (certificationCompanionLiveAlertDto) => {
  return new CertificationCompanionLiveAlert(certificationCompanionLiveAlertDto);
};
