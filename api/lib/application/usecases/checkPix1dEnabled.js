const settings = require('../../config');

module.exports = {
  async execute() {
    return settings.featureToggles.isPix1dEnabled;
  },
};
