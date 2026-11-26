import { PassThrough, pipeline } from 'node:stream';

import iconv from 'iconv-lite';
import papa from 'papaparse';

import { CsvImportError } from '../../../../../../shared/domain/errors.js';

const ERRORS = {
  ENCODING_NOT_SUPPORTED: 'ENCODING_NOT_SUPPORTED',
  BAD_CSV_FORMAT: 'BAD_CSV_FORMAT',
  HEADER_REQUIRED: 'HEADER_REQUIRED',
};

const LINES_BUFFER_SIZE = 1000;

const PARSING_OPTIONS = {
  header: true,
  skipEmptyLines: 'greedy',
  transform: (value) => {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      return trimmedValue.length ? trimmedValue : undefined;
    }
    return value;
  },
  transformHeader: (header) => header.trim(),
};

class GenericParser {
  #input;
  #errors;

  // compute heading
  #columns;
  // compute support_encoding
  #supportedEncodings;

  constructor({ buffer, importFormat = {} }) {
    this.#input = buffer;
    this.#errors = [];

    // compute heading
    this.#columns = importFormat.config.headers;

    // compute support_encoding
    this.#supportedEncodings = importFormat.config.acceptedEncoding.toSorted((encoding) =>
      encoding === 'utf8' ? -1 : 1,
    );
  }

  static buildParser() {
    return new GenericParser(...arguments);
  }

  parse(encoding) {
    const { learnerLines, fields } = this.#parse(encoding);

    this.#throwHasErrors();

    this.#checkColumns(fields);

    this.#throwHasErrors();

    return learnerLines;
  }

  /**
   * Parse a file line by line from a readable stream, without loading it in memory.
   * Lines are yielded as soon as they are parsed, the stream is read only as fast as the lines are consumed.
   * Same errors than `parse`: bad CSV format, missing headers. The first one found is thrown by the generator. Stopping the iteration early (break, throw) destroys the stream.
   *
   * @param {{ readableStream: import('node:stream').Readable, encoding: string }} params
   * @returns {AsyncGenerator<Record<string, string|undefined>>}
   */
  async *parseStream({ readableStream, encoding }) {
    const fields = [];
    const csvStream = papa.parse(papa.NODE_STREAM_INPUT, {
      ...PARSING_OPTIONS,
      transformHeader: (header) => {
        const trimmedHeader = PARSING_OPTIONS.transformHeader(header);
        fields.push(trimmedHeader);
        return trimmedHeader;
      },
    });
    // papaparse is paused each time its output is full, which is costly: the lines go through a bigger buffer
    const linesBuffer = new PassThrough({ objectMode: true, highWaterMark: LINES_BUFFER_SIZE });
    const lines = pipeline(readableStream, iconv.decodeStream(encoding), csvStream, linesBuffer, () => {
      // errors are forwarded by the streams to the consumer of the lines
    });

    // In stream mode papaparse does not report format errors, they are deduced from the lines:
    // - a line without as many values as headers is a FieldMismatch
    // - a single column means the delimiter was not detected, as a valid file always has several columns
    let areHeadersChecked = false;
    const validate = (line) => {
      if (!areHeadersChecked) {
        areHeadersChecked = true;
        this.#checkColumns(fields);
        this.#throwHasErrors();
      }
      if (Object.keys(line).length !== fields.length) {
        this.#errors.push(new CsvImportError(ERRORS.BAD_CSV_FORMAT));
        this.#throwHasErrors();
      }
    };

    for await (const line of lines) {
      validate(line);
      yield line;
    }
    // handle csv file with only headers
    this.#checkColumns(fields);
    this.#throwHasErrors();
  }

  /**
   * Identify which encoding has the given file.
   * To check it, we decode and parse the first line of the file with supported encodings.
   * If there is one with at least "First name" or "Student number" correctly parsed and decoded.
   */
  getEncoding() {
    const supported_encodings = this.#supportedEncodings;
    for (const encoding of supported_encodings) {
      const decodedInput = iconv.decode(this.#input, encoding);
      if (!decodedInput.includes('�')) {
        return encoding;
      }
    }

    this.#errors.push(new CsvImportError(ERRORS.ENCODING_NOT_SUPPORTED));
    this.#throwHasErrors();
  }

  #throwHasErrors() {
    if (this.#errors.length > 0) throw this.#errors;
  }

  #parse(encoding) {
    const decodedInput = iconv.decode(this.#input, encoding);
    const {
      data: learnerLines,
      meta: { fields },
      errors,
    } = papa.parse(decodedInput, PARSING_OPTIONS);

    if (errors.length) {
      const hasErrors = errors.some((error) => ['Delimiter', 'FieldMismatch'].includes(error.type));

      if (hasErrors) {
        this.#errors.push(new CsvImportError(ERRORS.BAD_CSV_FORMAT));
      }
    }

    this.#throwHasErrors();

    return { learnerLines, fields };
  }

  #checkColumns(parsedColumns) {
    if (parsedColumns.length <= 1) {
      this.#errors.push(new CsvImportError(ERRORS.BAD_CSV_FORMAT));
      return;
    }
    // Required columns
    const mandatoryColumn = this.#columns.filter((c) => c.required);

    mandatoryColumn.forEach((colum) => {
      if (!parsedColumns.includes(colum.name)) {
        this.#errors.push(new CsvImportError(ERRORS.HEADER_REQUIRED, { field: colum.name }));
      }
    });
  }
}

export { GenericParser };
