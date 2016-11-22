const NodeCache = require('node-cache');

const ONE_HOUR = 60 * 60;

const cache = new NodeCache({ stdTTL: ONE_HOUR }); // in seconds

module.exports = cache;
