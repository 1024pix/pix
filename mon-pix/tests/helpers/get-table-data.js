import { within } from '@1024pix/ember-testing-library/addon';
import zipObject from 'lodash/zipObject';

/**
 * Utility function to return table data by row
 * @param table
 * @returns {Promise<*>}
 */
export async function getTableData(table) {
  const header = await within(table).findAllByRole('columnheader');
  const headerTitles = header.map((th) => th.innerText);
  const rows = await within(table).findAllByRole('row');
  const rowsAndCells = (await Promise.all(rows.map(async (row) => await within(row).queryAllByRole('cell'))))
    .filter((row) => row.length !== 0)
    .map((row) => row.map((cell) => cell.innerText));

  return rowsAndCells.map((rowValues) => zipObject(headerTitles, rowValues));
}
