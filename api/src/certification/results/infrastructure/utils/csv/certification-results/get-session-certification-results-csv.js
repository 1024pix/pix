import dayjs from 'dayjs';

import { getCsvContent } from '../../../../../../shared/infrastructure/utils/csv/write-csv-utils.js';
import { SessionCertificationResultsCsvBuilder } from './SessionCertificationResultsCsvBuilder.js';

export async function getSessionCertificationResultsCsv({
  sessionId,
  certificationResults,
  i18n,
  sessionForResultsSharingRepository,
}) {
  const session = await sessionForResultsSharingRepository.get(sessionId);
  const certificationResultsCsvBuilder = new SessionCertificationResultsCsvBuilder({
    session,
    certificationResults,
    i18n,
  });
  const content = await getCsvContent(certificationResultsCsvBuilder.build());

  const dateWithTime = dayjs(`${session.date} ${session.time}`, 'YYYY-MM-DD HH:mm');
  const filename = i18n.__('certification-results-csv.filenames.SESSION_CERTIFICATION_RESULTS_FILENAME', {
    dateWithTime: dateWithTime.format('YYYYMMDD_HHmm'),
    sessionId: session.id,
  });

  return { filename, content };
}
