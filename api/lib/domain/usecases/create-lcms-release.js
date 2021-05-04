const lcms = require('../../infrastructure/lcms');

module.exports = async function createLcmsRelease() {
  await lcms.createRelease();
};
