import dayjs from 'dayjs';

import { getPixAppUrl, getPixWebsiteDomain, getPixWebsiteUrl } from '../../../../shared/domain/services/url-service.js';
import { getI18n } from '../../../../shared/infrastructure/i18n/i18n.js';
import { mailer } from '../../../../shared/mail/infrastructure/services/mailer.js';
import { CertificationResultsLinkByEmailToken } from '../../../results/domain/models/tokens/CertificationResultsLinkByEmailToken.js';

const EMAIL_ADDRESS_NO_RESPONSE = 'ne-pas-repondre@pix.fr';

export function sendNotificationToCertificationCenterRefererForCleaResults({ email, sessionId, sessionDate }) {
  const formattedSessionDate = dayjs(sessionDate).locale('fr').format('DD/MM/YYYY');

  const i18nFr = getI18n('fr');

  const options = {
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: i18nFr.__('email-sender-name.pix-app'),
    to: email,
    template: mailer.acquiredCleaResultTemplateId,
    variables: { sessionId, sessionDate: formattedSessionDate },
  };

  return mailer.sendEmail(options);
}

export function sendCertificationResultEmail({
  email,
  sessionId,
  sessionDate,
  certificationCenterName,
  resultRecipientEmail,
  daysBeforeExpiration,
}) {
  const token = CertificationResultsLinkByEmailToken.generate({
    sessionId,
    resultRecipientEmail,
    daysBeforeExpiration,
  });
  const formattedSessionDate = dayjs(sessionDate).locale('fr').format('DD/MM/YYYY');

  const i18nFr = getI18n('fr');
  const i18nEn = getI18n('en');

  const templateVariables = {
    certificationCenterName,
    sessionId,
    sessionDate: formattedSessionDate,
    fr: {
      homeName: getPixWebsiteDomain('fr-FR'),
      homeUrl: getPixWebsiteUrl('fr-FR'),
      homeNameInternational: getPixWebsiteDomain('fr'),
      homeUrlInternational: getPixWebsiteUrl('fr'),
      link: getPixAppUrl('fr', { pathname: `/api/sessions/download-results/${token}` }),
      title: i18nFr.__('certification-result-email.title', { sessionId }),
      doNotReply: i18nFr.__('certification-result-email.params.doNotReply'),
      download: i18nFr.__('certification-result-email.params.download'),
      emailValidFor: i18nFr.__('certification-result-email.params.emailValidFor'),
      findOutMore: i18nFr.__('certification-result-email.params.findOutMore'),
      findOutMoreFranceSuffix: i18nFr.__('certification-result-email.params.findOutMoreFranceSuffix'),
      findOutMoreInternationalSuffix: i18nFr.__('certification-result-email.params.findOutMoreInternationalSuffix'),
      guidelines: i18nFr.__('certification-result-email.params.guidelines'),
      guidelinesLinkName: i18nFr.__('certification-result-email.params.guidelinesLinkName'),
      overviewText: i18nFr.__('certification-result-email.params.overviewText'),
      resultsAvailable: i18nFr.__('certification-result-email.params.resultsAvailable'),
      subject: i18nFr.__('certification-result-email.params.subject'),
      viewResultsInProfile: i18nFr.__('certification-result-email.params.viewResultsInProfile'),
    },
    en: {
      homeName: getPixWebsiteDomain('en'),
      homeUrl: getPixWebsiteUrl('en'),
      link: getPixAppUrl('en', { pathname: `/api/sessions/download-results/${token}` }),
      title: i18nEn.__('certification-result-email.title', { sessionId }),
      doNotReply: i18nEn.__('certification-result-email.params.doNotReply'),
      download: i18nEn.__('certification-result-email.params.download'),
      emailValidFor: i18nEn.__('certification-result-email.params.emailValidFor'),
      findOutMore: i18nEn.__('certification-result-email.params.findOutMore'),
      findOutMoreFranceSuffix: i18nEn.__('certification-result-email.params.findOutMoreFranceSuffix'),
      findOutMoreInternationalSuffix: i18nEn.__('certification-result-email.params.findOutMoreInternationalSuffix'),
      guidelines: i18nEn.__('certification-result-email.params.guidelines'),
      guidelinesLinkName: i18nEn.__('certification-result-email.params.guidelinesLinkName'),
      overviewText: i18nEn.__('certification-result-email.params.overviewText'),
      resultsAvailable: i18nEn.__('certification-result-email.params.resultsAvailable'),
      subject: i18nEn.__('certification-result-email.params.subject'),
      viewResultsInProfile: i18nEn.__('certification-result-email.params.viewResultsInProfile'),
    },
  };

  return mailer.sendEmail({
    from: EMAIL_ADDRESS_NO_RESPONSE,
    fromName: `${i18nFr.__('email-sender-name.pix-app')} / ${i18nEn.__('email-sender-name.pix-app')}`,
    to: email,
    template: mailer.certificationResultTemplateId,
    variables: templateVariables,
  });
}

export const mailService = {
  sendNotificationToCertificationCenterRefererForCleaResults,
  sendCertificationResultEmail,
};
