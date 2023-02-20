import { promisify } from 'util';
const resolveMx = promisify(require('dns').resolveMx);

export default {
  checkDomainIsValid(address) {
    const domain = address.replace(/.*@/g, '');
    return resolveMx(domain).then(() => true);
  },
};
