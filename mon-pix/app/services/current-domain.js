import Service  from '@ember/service';
import { last } from 'lodash';

export default Service.extend({

  getExtension() {
    return last(location.hostname.split('.'));
  }

});
