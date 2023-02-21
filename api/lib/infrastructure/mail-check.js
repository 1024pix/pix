import { promisify } from 'util';
import dns from 'dns';
const resolveMx = promisify(dns.resolveMx);

export default {
  checkDomainIsValid(address) {
    const domain = address.replace(/.*@/g, '');
    return resolveMx(domain).then(() => true);
  },
};
