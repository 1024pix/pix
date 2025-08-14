import * as injectedCertificationCenterRepository from '../../../certification/shared/infrastructure/repositories/certification-center-repository.js';
import * as injectedCertificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';
import * as injectedCertificationCenterInvitationService from '../services/certification-center-invitation-service.js';
const createOrUpdateCertificationCenterInvitation = async function ({
  certificationCenterId,
  emails,
  locale,
  certificationCenterRepository = injectedCertificationCenterRepository,
  certificationCenterInvitationRepository = injectedCertificationCenterInvitationRepository,
  certificationCenterInvitationService = injectedCertificationCenterInvitationService,
} = {}) {
  const certificationCenter = await certificationCenterRepository.get({ id: certificationCenterId });

  const uniqueEmails = [...new Set(emails)];
  const trimmedUniqueEmails = uniqueEmails.map((email) => email.replace(/[\s\r\n]/g, ''));

  for (const email of trimmedUniqueEmails) {
    await certificationCenterInvitationService.createOrUpdateCertificationCenterInvitation({
      certificationCenterInvitationRepository,
    })({
      certificationCenter,
      email,
      locale,
    });
  }
};

export { createOrUpdateCertificationCenterInvitation };
