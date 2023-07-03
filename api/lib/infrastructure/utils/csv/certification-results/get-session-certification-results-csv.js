import dayjs from 'dayjs';
import { SessionCertificationResultsCsvBuilder } from './SessionCertificationResultsCsvBuilder.js';
import { getCsvContent } from '../write-csv-utils.js';

const getSessionCertificationResultsCsv = async function ({ session, certificationResults, i18n }) {
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
};

export { getSessionCertificationResultsCsv };
