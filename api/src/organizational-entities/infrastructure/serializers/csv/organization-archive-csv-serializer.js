import isEmpty from 'lodash/isEmpty.js';

import { checkCsvHeader, parseCsvData, readCsvFile } from '../../../../shared/infrastructure/helpers/csv.js';

export const requiredFieldNamesForOrganizationBatchArchive = ["ID de l'organisation"];

export async function deserializeForOrganizationBatchArchive(
  file,
  csvHelper = { checkCsvHeader, readCsvFile, parseCsvData },
) {
  await csvHelper.checkCsvHeader({ filePath: file, requiredFieldNames: requiredFieldNamesForOrganizationBatchArchive });
  const cleanedData = await csvHelper.readCsvFile(file);

  const batchOrganizationOptionsWithHeader = {
    skipEmptyLines: true,
    header: true,
    transformHeader: (header) => header?.trim(),
    transform: (value, columnName) => {
      if (typeof value === 'string') {
        value = value.trim();
      }
      if (!isEmpty(value)) {
        if (columnName === columnName) {
          value = Number(value);
        }
      }
      return value;
    },
  };

  const parsedData = await csvHelper.parseCsvData(cleanedData, batchOrganizationOptionsWithHeader);

  return parsedData.map((data) => data[requiredFieldNamesForOrganizationBatchArchive]);
}
