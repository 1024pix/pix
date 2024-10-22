import Joi from 'joi';

import { checkCsvHeader, parseCsvWithHeader } from '../../infrastructure/helpers/csv.js';

/**
 * Create a parser for a CSV file with the given columns schema
 * @param {Record<string, Joi.Schema>} columnsSchema
 * @returns {Promise<Array<Record<string, any>>>} parsed data
 */
export function csvFileParser(columnsSchema = []) {
  return async (filePath) => {
    const columnNames = columnsSchema.map((column) => column.name);

    await checkCsvHeader({ filePath, requiredFieldNames: columnNames });

    return parseCsvWithHeader(filePath, {
      header: true,
      skipEmptyLines: true,
      transform: (value, columnName) => {
        const column = columnsSchema.find((column) => column.name === columnName);

        if (!column) return value;

        return Joi.attempt(value, column.schema);
      },
    });
  };
}

/**
 * Create a parser for comma separated strings
 * @param {string} separator (default: ',')
 * @returns {Array<string>}
 */
export function commaSeparatedStringParser(separator = ',') {
  return (str) => {
    const data = str.split(separator);
    return Joi.attempt(data, Joi.array().items(Joi.string().trim()));
  };
}

/**
 * Create a parser for comma separated numbers
 * @param {string} separator (default: ',')
 * @returns {Array<number>}
 */
export function commaSeparatedNumberParser(separator = ',') {
  return (nbr) => {
    const data = nbr.split(separator);
    return Joi.attempt(data, Joi.array().items(Joi.number()));
  };
}
