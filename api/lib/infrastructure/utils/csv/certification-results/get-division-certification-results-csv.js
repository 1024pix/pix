import dayjs from 'dayjs';

import { getCsvContent } from '../../../../../src/shared/infrastructure/utils/csv/write-csv-utils.js';
import { DivisionCertificationResultsCsvBuilder } from './DivisionCertificationResultsCsvBuilder.js';

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
