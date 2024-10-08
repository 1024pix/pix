import dayjs from 'dayjs';

import * as translations from '../../../../../translations/index.js';
import { mailer } from '../../../../shared/mail/infrastructure/services/mailer.js';

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';

function sendNotificationToCertificationCenterRefererForCleaResults({ email, sessionId, sessionDate }) {
  const formattedSessionDate = dayjs(sessionDate).locale('fr').format('DD/MM/YYYY');

  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: translations.fr['email-sender-name']['pix-app'],
    to: email,
    template: mailer.acquiredCleaResultTemplateId,
    variables: { sessionId, sessionDate: formattedSessionDate },
  };

  return mailer.sendEmail(options);
}

const mailService = {
  sendNotificationToCertificationCenterRefererForCleaResults,
};

/**
 * @property {function} sendNotificationToCertificationCenterRefererForCleaResults
 */
export { mailService, sendNotificationToCertificationCenterRefererForCleaResults };
