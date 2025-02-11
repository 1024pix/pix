/**
 * @typedef {import('../script.js').Script} Script
 */

export const DryRunMixin = (baseClazz) =>
  /**
   * Had a dry rn opton to a script
   * @class
   * @augments Script
   */
  class extends baseClazz {
    constructor(metaInfo) {
      const metaInfoWithAddon = { ...metaInfo, options: metaInfo.options ?? {} };
      metaInfoWithAddon.options.dryRun = {
        type: 'boolean',
        describe: 'Tag the script execution as a dry run or not',
        demandOption: true,
      };

      super(metaInfoWithAddon);
    }
  };
