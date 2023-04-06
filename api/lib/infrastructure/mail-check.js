const { Resolver } = require('node:dns').promises;
const { mailing } = require('../config.js');
module.exports = {
  checkDomainIsValid(address) {
    if (!mailing.enabled) {
      return Promise.resolve(true);
    }

    const domain = address.replace(/.*@/g, '');
    return Resolver.resolveMx(domain).then(() => true);
  },
};
