const { promisify } = require('util');
const dns = require('dns');
const resolveMx = promisify(dns.resolveMx);

module.exports = {
  checkDomainIsValid(address) {
    const domain = address.replace(/.*@/g, '');
    return resolveMx(domain).then(() => true);
  },
};
