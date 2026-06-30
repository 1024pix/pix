import { getCsvContent } from '../../../../../shared/infrastructure/utils/csv/write-csv-utils.js';

/**
 * @param {object} params
 * @param {Array<Center>} params.centers
 * @returns {Promise<string>}
 */
export async function serialize({ centers }) {
  return getCsvContent({ data: centers, fileHeaders: [{ label: 'externalId', value: 'externalId' }] });
}
