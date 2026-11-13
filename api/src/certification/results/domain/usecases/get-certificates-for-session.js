import { NoCertificationResultsToDownloadError } from '../errors.js';
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
  if (!sessionAuthorization || !sessionAuthorization.canCreateCertificatesPdf) {
    throw new NoCertificationResultsToDownloadError();
  }

  const sessionCertificates = await dependencies.getSessionCertificatesPDF({
    sessionId,
    isFrenchDomainExtension,
    i18n,
  });

  if (!sessionCertificates) {
    throw new NoCertificationResultsToDownloadError();
  }

  return sessionCertificates;
}
