import { getSessionCertificatesPDF } from '../services/get-session-certificates-pdf.js';

export async function getCertificatesForSession({
  sessionId,
  isFrenchDomainExtension,
  i18n,
  dependencies = {
    getSessionCertificatesPDF,
  },
}) {
  return dependencies.getSessionCertificatesPDF({
    sessionId,
    isFrenchDomainExtension,
    i18n,
  });
}
