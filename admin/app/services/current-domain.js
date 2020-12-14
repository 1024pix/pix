import Service from '@ember/service';
import last from 'lodash/last';

export default class CurrentDomainService extends Service {

  getExtension() {
    return last(location.hostname.split('.'));
  }
}
