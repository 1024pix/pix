import { config } from '../../../src/shared/config.js';
import { tokenService } from '../../../src/shared/domain/services/token-service.js';

const generateResultsLink = function ({ sessionId, i18n }) {
  const daysBeforeExpiration = 30;

  const token = tokenService.createCertificationResultsLinkToken({ sessionId, daysBeforeExpiration });
  const lang = i18n.getLocale();
  const link = `${config.domain.pixApp + config.domain.tldOrg}/api/sessions/download-all-results/${token}?lang=${lang}`;

  return link;
};

export { generateResultsLink };
