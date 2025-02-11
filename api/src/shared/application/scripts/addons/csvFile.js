import { csvFileParser } from '../parsers.js';

export const CsvFileMixin = (csvColumns) => (baseClazz) =>
  /**
   * Had file option that take a CSV input
   * @class
   * @augments Script
   */
  class extends baseClazz {
    constructor(metaInfo) {
      const metaInfoWithAddon = { ...metaInfo, options: metaInfo.options || {} };
      metaInfoWithAddon.options.file = {
        type: 'string',
        describe: 'CSV File with data input to be processed',
        demandOption: true,
        coerce: csvFileParser(csvColumns),
      };

      super(metaInfoWithAddon);
    }
  };
