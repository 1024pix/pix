import config from '../config/environment';
import _ from 'lodash/lodash';

export default function callOnlyOnce (targetFunction) {
  if (config.EmberENV.useDelay) {
    return _.throttle(targetFunction, 1000, { leading: true, trailing: false});
  } else {
    return targetFunction;
  }
}
