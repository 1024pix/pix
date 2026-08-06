import { getPixAppUrl } from '../../../../shared/domain/services/url-service.js';
import { CertificationResultsLinkToken } from '../models/tokens/CertificationResultsLinkToken.js';

export function generateResultsLink({ sessionId, i18n }) {
  const token = CertificationResultsLinkToken.generate({ sessionId });
  const locale = i18n.getLocale();
  return getPixAppUrl(locale, {
    pathname: '/resultats-session',
    hash: token,
  });
}
