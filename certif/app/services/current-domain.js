import Service, { service } from '@ember/service';
import last from 'lodash/last';

const FRANCE_TLD = 'fr';

export default class CurrentDomainService extends Service {
  @service location;

  get isFranceDomain() {
    return this.getExtension() === FRANCE_TLD;
  }

  getExtension() {
    const { hostname } = new URL(this.location.href);
    return last(hostname.split('.'));
  }

  get domain() {
    const { host, hostname } = new URL(this.location.href);

    if (hostname === 'localhost') return hostname;

    return host.split('.').slice(-2).join('.');
  }
}
