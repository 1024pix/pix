import * as getCertificatesForSessionService from '../services/get-certificates-for-session.js';

export async function getCertificatesForSession({
  sessionId,
  isFrenchDomainExtension,
  i18n,
  dependencies = {
    getCertificatesForSession: getCertificatesForSessionService.getCertificatesForSession,
  },
}) {
  return dependencies.getCertificatesForSession({
    sessionId,
    isFrenchDomainExtension,
    i18n,
  });
}
