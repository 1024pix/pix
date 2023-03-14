import { tokenService } from './token-service.js';
import { config } from '../../config.js';

const generateResultsLink = function (sessionId) {
  const daysBeforeExpiration = 30;

  const token = tokenService.createCertificationResultsLinkToken({ sessionId, daysBeforeExpiration });
  const link = `${config.domain.pixApp + config.domain.tldOrg}/api/sessions/download-all-results/${token}`;

  return link;
};

export { generateResultsLink };
