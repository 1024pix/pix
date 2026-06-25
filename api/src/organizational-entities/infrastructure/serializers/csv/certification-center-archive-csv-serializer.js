import isEmpty from 'lodash/isEmpty.js';

import { checkCsvHeader, parseCsvData, readCsvFile } from '../../../../shared/infrastructure/helpers/csv.js';

export const requiredFieldNamesForCertificationCenterBatchArchive = ['ID du centre de certification'];

export async function deserializeForCertificationCenterBatchArchive(
  file,
  csvHelper = { checkCsvHeader, readCsvFile, parseCsvData },
) {
  await csvHelper.checkCsvHeader({
    filePath: file,
    requiredFieldNames: requiredFieldNamesForCertificationCenterBatchArchive,
  });
  const cleanedData = await csvHelper.readCsvFile(file);

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

  const parsedData = await csvHelper.parseCsvData(cleanedData, batchCertificationCenterOptionsWithHeader);

  return parsedData.map((data) => data['ID du centre de certification']);
}
