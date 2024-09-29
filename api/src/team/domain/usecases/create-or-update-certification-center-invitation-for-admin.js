import {
  SendingEmailError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
} from '../../../shared/domain/errors.js';
import { CertificationCenterInvitation } from '../models/CertificationCenterInvitation.js';

const createOrUpdateCertificationCenterInvitationForAdmin = async function ({
  certificationCenterId,
  email,
  locale,
  role,
  certificationCenterInvitationRepository,
  mailService,
}) {
  let certificationCenterInvitation, isInvitationCreated;

  const alreadyExistingPendingInvitationForThisEmail =
    await certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId({
      email,
      certificationCenterId,
    });
  const shouldCreateInvitation = !alreadyExistingPendingInvitationForThisEmail;

  if (shouldCreateInvitation) {
    const newInvitation = CertificationCenterInvitation.create({ email, role, certificationCenterId });
    certificationCenterInvitation = await certificationCenterInvitationRepository.create(newInvitation);
    isInvitationCreated = true;
  } else {
    certificationCenterInvitation = await certificationCenterInvitationRepository.update(
      alreadyExistingPendingInvitationForThisEmail,
    );
    isInvitationCreated = false;
  }

  const emailingAttempt = await mailService.sendCertificationCenterInvitationEmail({
    email,
    locale,
    certificationCenterName: certificationCenterInvitation.certificationCenterName,
    certificationCenterInvitationId: certificationCenterInvitation.id,
    code: certificationCenterInvitation.code,
  });
  if (emailingAttempt.hasFailed()) {
    if (emailingAttempt.hasFailedBecauseDomainWasInvalid()) {
      throw new SendingEmailToInvalidDomainError(email);
    }

    if (emailingAttempt.hasFailedBecauseEmailWasInvalid()) {
      throw new SendingEmailToInvalidEmailAddressError(email, emailingAttempt.errorMessage);
    }

    throw new SendingEmailError(email);
  }

  return { isInvitationCreated, certificationCenterInvitation };
};

export { createOrUpdateCertificationCenterInvitationForAdmin };
