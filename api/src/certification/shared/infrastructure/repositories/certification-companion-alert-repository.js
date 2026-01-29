import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCompanionLiveAlert } from '../../domain/models/CertificationCompanionLiveAlert.js';

export const getAllByAssessmentId = async ({ assessmentId }) => {
  const knexConn = DomainTransaction.getConnection();
  const certificationCompanionLiveAlertsDto = await knexConn('certification-companion-live-alerts')
    .select('id', 'assessmentId', 'status')
    .where({
      assessmentId,
    });

  return certificationCompanionLiveAlertsDto.map(_toDomain);
};

const _toDomain = (certificationCompanionLiveAlertDto) => {
  return new CertificationCompanionLiveAlert(certificationCompanionLiveAlertDto);
};
