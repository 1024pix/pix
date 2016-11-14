const NodeCache = require( "node-cache" );

const cache = new NodeCache({ stdTTL: 10 * 60 }); // in seconds

module.exports = cache;
