import isEmpty from 'lodash/isEmpty.js';

import { csvHelper } from '../../../../shared/infrastructure/helpers/csv.js';

export const requiredFieldNamesForCertificationCenterBatchArchive = ['ID du centre de certification'];

export async function deserializeForCertificationCenterBatchArchive(
  file,
  { checkCsvHeader, readCsvFile, parseCsvData } = csvHelper,
) {
  await checkCsvHeader({ filePath: file, requiredFieldNames: requiredFieldNamesForCertificationCenterBatchArchive });
  const cleanedData = await readCsvFile(file);

  const batchCertificationCenterOptionsWithHeader = {
    skipEmptyLines: true,
    header: true,
    transformHeader: (header) => header?.trim(),
    transform: (value, columnName) => {
      if (typeof value === 'string') {
        value = value.trim();
      }
      if (!isEmpty(value)) {
        if (columnName === 'ID du centre de certification') {
          value = Number(value);
        }
      }
      return value;
    },
  };

  const parsedData = await parseCsvData(cleanedData, batchCertificationCenterOptionsWithHeader);

  return parsedData.map((data) => data['ID du centre de certification']);
}
