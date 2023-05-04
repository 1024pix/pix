import { tokenService } from './token-service.js';
import { settings } from '../../config.js';

const generateResultsLink = function (sessionId) {
  const daysBeforeExpiration = 30;

  const token = tokenService.createCertificationResultsLinkToken({ sessionId, daysBeforeExpiration });
  const link = `${settings.domain.pixApp + settings.domain.tldOrg}/api/sessions/download-all-results/${token}`;

  return link;
};

export { generateResultsLink };
