import dayjs from 'dayjs';
import { DivisionCertificationResultsCsvBuilder } from './DivisionCertificationResultsCsvBuilder.js';
import { getCsvContent } from '../write-csv-utils.js';

const getDivisionCertificationResultsCsv = async function ({ division, certificationResults, i18n }) {
  const divisionCertificationResultsCsvBuilder = new DivisionCertificationResultsCsvBuilder({
    certificationResults,
    i18n,
  });
  const content = await getCsvContent(divisionCertificationResultsCsvBuilder.build());

  const filename = i18n.__('certification-results-csv.filenames.DIVISION_CERTIFICATION_RESULTS_FILENAME', {
    dateWithTime: dayjs().format('YYYYMMDD'),
    division,
  });

  return { filename, content };
};

export { getDivisionCertificationResultsCsv };
