import { Resolver } from 'node:dns/promises';

const resolver = new Resolver();

let resolveMx = resolver.resolveMx.bind(resolver);

const assertEmailDomainHasMx = function (emailAddress) {
  const domainName = emailAddress.replace(/.*@/g, '');
  return resolveMx(domainName).then(() => true);
};

const setResolveMx = function (resolveMxFn) {
  resolveMx = resolveMxFn;
};

const clearResolveMx = function () {
  resolveMx = resolver.resolveMx.bind(resolver);
};

export const mailCheck = { assertEmailDomainHasMx, clearResolveMx, setResolveMx };
