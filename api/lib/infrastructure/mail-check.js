const { promisify } = require('util');
const resolveMx = promisify(require('dns').resolveMx);

module.exports = {
  checkDomainIsValid(address) {
    const domain = address.replace(/.*@/g, '');
    return resolveMx(domain).then(() => true);
  },
};
