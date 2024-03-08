import { promises } from 'node:dns';

const { Resolver } = promises;

const resolver = new Resolver();

let resolveMx = resolver.resolveMx.bind(resolver);

const checkDomainIsValid = function (emailAddress) {
  const domain = emailAddress.replace(/.*@/g, '');
  return resolveMx(domain).then(() => true);
};

const setResolveMx = function (resolveMxFn) {
  resolveMx = resolveMxFn;
};

const clearResolveMx = function () {
  resolveMx = resolver.resolveMx.bind(resolver);
};

export { checkDomainIsValid, clearResolveMx, setResolveMx };
