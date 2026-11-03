import fs from 'node:fs';

import Joi from 'joi';

import { checkCsvHeader, parseCsvWithHeader, streamCsv } from '../../infrastructure/helpers/csv.js';

/**
 * Create a parser for a CSV file with the given column schema
 * @param {Record<string, Joi.Schema>} columnSchemas
 * @returns {Promise<Array<Record<string, any>>>} parsed data
 */
export function csvFileParser(columnSchemas = []) {
  return async (filePath) => {
    const columnNames = columnSchemas.map((column) => column.name);

    await checkCsvHeader({ filePath, requiredFieldNames: columnNames });

    return parseCsvWithHeader(filePath, {
      header: true,
      skipEmptyLines: true,
      transform: (value, columnName) => {
        const column = columnSchemas.find((column) => column.name === columnName);

        if (!column) return value;

        return Joi.attempt(value, column.schema, value);
      },
    });
  };
}

/**
 * Stream CSV file by chunk with the given column schema
 * @param {Record<string, Joi.Schema>} columnSchemas
 * @returns {Promise<Function>} function to process each chunk
 */
export function csvFileStreamer(columnSchemas = []) {
  return async (filePath) => {
    return async (onChunk, chunkSize = 1) => {
      const dataStream = fs.createReadStream(filePath);
      const parseStream = await streamCsv({ header: true, skipEmptyLines: true });
      dataStream.pipe(parseStream);

      let chunk = [];
      let processing = Promise.resolve();

      return new Promise((resolve, reject) => {
        parseStream.on('data', (row) => {
          try {
            const validatedRow = Joi.attempt(
              row,
              Joi.object().keys(
                columnSchemas.reduce((acc, column) => {
                  acc[column.name] = column.schema;
                  return acc;
                }, {}),
              ),
              row,
            );

            chunk.push(validatedRow);

            if (chunk.length >= chunkSize) {
              const chunkCopy = [...chunk];
              chunk = [];
              processing = processing.then(() => onChunk(chunkCopy));
            }
          } catch (error) {
            parseStream.destroy();
            reject(error);
          }
        });

        parseStream.on('finish', () => {
          processing
            .then(() => {
              if (chunk.length > 0) {
                return onChunk(chunk);
              }
            })
            .then(() => resolve(true))
            .catch(reject);
        });

        parseStream.on('error', (error) => {
          parseStream.destroy();
          reject(error);
        });
      });
    };
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

/**
 * Create a parser for date strings in the format "YYYY-MM-DD"
 * @returns {Date}
 */
export function isoDateParser() {
  return (date) => {
    const schema = Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .message('Invalid date format. Expected "YYYY-MM-DD".');

    const { error, value: validatedDate } = schema.validate(date);
    if (error) {
      throw new Error(error.message);
    }
    return new Date(validatedDate);
  };
}

/**
 * Create a parser for a JSON file with the given schema
 * @param {Joi.Schema} schema
 * @returns {Promise<any>} parsed and validated data
 */
export function jsonFileParser(schema = Joi.any()) {
  return async (filePath) => {
    const content = await fs.promises.readFile(filePath, 'utf8');

    let data;

    try {
      data = JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON file "${filePath}": ${error.message}`, {
        cause: error,
      });
    }

    return Joi.attempt(data, schema, {
      abortEarly: false,
      convert: true,
    });
  };
}
