import classic from 'ember-classic-decorator';
import Service  from '@ember/service';
import { last } from 'lodash';

@classic
export default class CurrentDomainService extends Service {
  getExtension() {
    return last(location.hostname.split('.'));
  }
}
