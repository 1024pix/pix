import { SendingEmailError, SendingEmailToInvalidDomainError } from '../errors';
import CertificationCenterInvitation from '../models/CertificationCenterInvitation';

export default async function createOrUpdateCertificationCenterInvitationForAdmin({
  email,
  certificationCenterId,
  locale,
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
    const newInvitation = CertificationCenterInvitation.create({ email, certificationCenterId });
    certificationCenterInvitation = await certificationCenterInvitationRepository.create(newInvitation);
    isInvitationCreated = true;
  } else {
    certificationCenterInvitation = await certificationCenterInvitationRepository.update(
      alreadyExistingPendingInvitationForThisEmail
    );
    isInvitationCreated = false;
  }

  const mailerResponse = await mailService.sendCertificationCenterInvitationEmail({
    email,
    locale,
    certificationCenterName: certificationCenterInvitation.certificationCenterName,
    certificationCenterInvitationId: certificationCenterInvitation.id,
    code: certificationCenterInvitation.code,
  });
  if (mailerResponse?.status === 'FAILURE') {
    if (mailerResponse.hasFailedBecauseDomainWasInvalid()) {
      throw new SendingEmailToInvalidDomainError(email);
    }

    throw new SendingEmailError();
  }

  return { isInvitationCreated, certificationCenterInvitation };
}
