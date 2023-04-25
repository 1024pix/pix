const { Resolver } = require('node:dns').promises;

const resolver = new Resolver();

module.exports = {
  checkDomainIsValid(emailAddress) {
    const domain = emailAddress.replace(/.*@/g, '');
    return resolver.resolveMx(domain).then(() => true);
  },
};
