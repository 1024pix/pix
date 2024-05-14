import Service from '@ember/service';
import last from 'lodash/last';

const FRANCE_TLD = 'fr';

export default class CurrentDomainService extends Service {
  get isFranceDomain() {
    return this.getExtension() === FRANCE_TLD;
  }

  getExtension() {
    return last(location.hostname.split('.'));
  }

  getEnvironmentBaseUrl(stringUrl = window.location) {
    return stringUrl.hostname.replace('orga', '');
  }
}
