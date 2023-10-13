import * as maillingService from './mail-service.js';
import { CertificationCenterInvitation } from '../models/index.js';
import {
  SendingEmailError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
} from '../errors.js';

const createOrUpdateCertificationCenterInvitation = function ({
  certificationCenterInvitationRepository,
  mailService = maillingService,
}) {
  return async function ({ certificationCenter, email, locale }) {
    let certificationCenterInvitation =
      await certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId({
        certificationCenterId: certificationCenter.id,
        email,
      });

    if (!certificationCenterInvitation) {
      const certificationCenterInvitationToCreate = CertificationCenterInvitation.create({
        certificationCenterId: certificationCenter.id,
        email,
      });

      certificationCenterInvitation = await certificationCenterInvitationRepository.create(
        certificationCenterInvitationToCreate,
      );
    }

    const mailerResponse = await mailService.sendCertificationCenterInvitationEmail({
      certificationCenterInvitationId: certificationCenterInvitation.id,
      certificationCenterName: certificationCenter.name,
      code: certificationCenterInvitation.code,
      email,
      locale,
    });

    if (mailerResponse.status !== 'SUCCESS') {
      if (mailerResponse.hasFailedBecauseDomainWasInvalid()) {
        throw new SendingEmailToInvalidDomainError(email);
      }

      if (mailerResponse.hasFailedBecauseEmailWasInvalid()) {
        throw new SendingEmailToInvalidEmailAddressError(email, mailerResponse.errorMessage);
      }

      throw new SendingEmailError();
    }

    await certificationCenterInvitationRepository.updateModificationDate(certificationCenterInvitation.id);
  };
};

export { createOrUpdateCertificationCenterInvitation };
