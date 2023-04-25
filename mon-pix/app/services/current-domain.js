import Service from '@ember/service';
import last from 'lodash/last';

const FRANCE_TLD = 'fr';

export default class CurrentDomainService extends Service {
  getExtension() {
    return last(location.hostname.split('.'));
  }

  get isFranceDomain() {
    return this.getExtension() === FRANCE_TLD;
  }
}
