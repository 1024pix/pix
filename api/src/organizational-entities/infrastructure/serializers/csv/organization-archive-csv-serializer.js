import isEmpty from 'lodash/isEmpty.js';

import { csvHelper } from '../../../../shared/infrastructure/helpers/csv.js';

export const requiredFieldNamesForOrganizationBatchArchive = ["ID de l'organisation"];

export async function deserializeForOrganizationBatchArchive(
  file,
  { checkCsvHeader, readCsvFile, parseCsvData } = csvHelper,
) {
  await checkCsvHeader({ filePath: file, requiredFieldNames: requiredFieldNamesForOrganizationBatchArchive });
  const cleanedData = await readCsvFile(file);

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

  const parsedData = await parseCsvData(cleanedData, batchOrganizationOptionsWithHeader);

  return parsedData.map((data) => data[requiredFieldNamesForOrganizationBatchArchive]);
}
