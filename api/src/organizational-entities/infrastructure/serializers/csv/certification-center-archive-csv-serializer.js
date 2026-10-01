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
      const trimmedValue = typeof value === 'string' ? value.trim() : value;
      if (!isEmpty(trimmedValue)) {
        if (columnName === 'ID du centre de certification') {
          return Number(trimmedValue);
        }
      }
      return trimmedValue;
    },
  };

  const parsedData = await parseCsvData(cleanedData, batchCertificationCenterOptionsWithHeader);

  return parsedData.map((data) => data['ID du centre de certification']);
}
