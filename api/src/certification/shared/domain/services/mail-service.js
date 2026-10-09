import { mailer } from '../../../../shared/mail/infrastructure/services/mailer.js';

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';
const PIX_NAME_FR = 'PIX - Ne pas répondre';

export function sendNotificationToOrganizationMembersForTargetProfileDetached({
  email,
  complementaryCertificationName,
}) {
  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: PIX_NAME_FR,
    to: email,
    template: mailer.targetProfileNotCertifiableTemplateId,
    variables: { complementaryCertificationName },
  };

  return mailer.sendEmail(options);
}

export const mailService = {
  sendNotificationToOrganizationMembersForTargetProfileDetached,
};
