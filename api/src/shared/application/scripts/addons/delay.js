export const DelayMixin = (baseClazz) =>
  /**
   * Had a delay method to a script
   * @class
   * @augments Script
   */
  class extends baseClazz {
    constructor(metaInfo) {
      const metaInfoWithAddon = { ...metaInfo, options: metaInfo.options || {} };
      metaInfoWithAddon.options.delay = {
        type: 'number',
        describe: 'In ms, will allow throttling. Default 100ms',
        demandOption: false,
        default: 100,
      };

      super(metaInfoWithAddon);
    }

    /**
     * This function will pause your script execution for a duration of X ms
     */
    async delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  };
