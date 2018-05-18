const NodeCache = require('node-cache');

const ONE_DAY = 60 * 60 * 24;

const cache = new NodeCache({ stdTTL: ONE_DAY }); // in seconds

module.exports = cache;
