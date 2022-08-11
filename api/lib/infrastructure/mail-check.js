const { promisify } = require('node:util');
const resolveMx = promisify(require('node:dns').resolveMx);

module.exports = {
  checkMail(address) {
    const domain = address.replace(/.*@/g, '');
    return resolveMx(domain).then(() => true);
  },
};
