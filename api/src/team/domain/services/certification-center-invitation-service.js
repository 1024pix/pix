import * as maillingService from '../../../../lib/domain/services/mail-service.js';
import {
  SendingEmailError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
} from '../../../shared/domain/errors.js';
import { CertificationCenterInvitation } from '../models/CertificationCenterInvitation.js';

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

    await _sendInvitationEmail(
      mailService,
      certificationCenterInvitation,
      certificationCenter,
      email,
      locale,
      certificationCenterInvitationRepository,
    );
  };
};

const resendCertificationCenterInvitation = function ({
  certificationCenterInvitationRepository,
  mailService = maillingService,
}) {
  return async function ({ certificationCenter, certificationCenterInvitation, locale }) {
    await _sendInvitationEmail(
      mailService,
      certificationCenterInvitation,
      certificationCenter,
      certificationCenterInvitation.email,
      locale,
      certificationCenterInvitationRepository,
    );
  };
};

export { createOrUpdateCertificationCenterInvitation, resendCertificationCenterInvitation };

async function _sendInvitationEmail(
  mailService,
  certificationCenterInvitation,
  certificationCenter,
  email,
  locale,
  certificationCenterInvitationRepository,
) {
  const emailingAttempt = await mailService.sendCertificationCenterInvitationEmail({
    certificationCenterInvitationId: certificationCenterInvitation.id,
    certificationCenterName: certificationCenter.name,
    code: certificationCenterInvitation.code,
    email,
    locale,
  });

  if (emailingAttempt.status !== 'SUCCESS') {
    if (emailingAttempt.hasFailedBecauseDomainWasInvalid()) {
      throw new SendingEmailToInvalidDomainError(email);
    }

    if (emailingAttempt.hasFailedBecauseEmailWasInvalid()) {
      throw new SendingEmailToInvalidEmailAddressError(email, emailingAttempt.errorMessage);
    }

    throw new SendingEmailError();
  }

  await certificationCenterInvitationRepository.updateModificationDate(certificationCenterInvitation.id);
}
