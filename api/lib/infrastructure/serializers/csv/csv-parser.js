const parse = require('csv-parse/lib/sync');

module.exports = {
  parse(input) {
    const lines = parse(input, {
      columns: true,
      relax_column_count: true,
      delimiter: [';', ','],
      trim: true,
      bom: true,
    });

    removeEmptyColumns(lines);
    return lines;
  }
};

const EMPTY_COLUMN = '';

function removeEmptyColumns(lines) {
  lines.forEach((csvLine) => {
    const columnList = Object.keys(csvLine);

    columnList
      .filter((column) => csvLine[column] === EMPTY_COLUMN)
      .forEach((column) => delete csvLine[column]);
  });
}
