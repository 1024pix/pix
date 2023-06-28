import { promises } from 'node:dns';

const { Resolver } = promises;

const resolver = new Resolver();

const checkDomainIsValid = function (emailAddress) {
  const domain = emailAddress.replace(/.*@/g, '');
  return resolver.resolveMx(domain).then(() => true);
};

export { checkDomainIsValid };
