import { getSessionCertificatesPDF } from '../services/get-session-certificates-pdf.js';

export async function getCertificatesForSession({
  sessionId,
  isFrenchDomainExtension,
  i18n,
  sessionAuthorizationAdapter,
  dependencies = {
    getSessionCertificatesPDF,
  },
}) {
  const sessionAuthorization = await sessionAuthorizationAdapter.find({ sessionId });
  if (!sessionAuthorization) {
    return null;
  }

  if (!sessionAuthorization.canCreateCertificatesPdf) {
    return null;
  }

  return dependencies.getSessionCertificatesPDF({
    sessionId,
    isFrenchDomainExtension,
    i18n,
  });
}
