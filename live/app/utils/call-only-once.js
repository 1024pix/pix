import config from '../config/environment';
import _ from 'pix-live/utils/lodash-custom';

export default function callOnlyOnce(targetFunction) {
  if (config.APP.useDelay) {
    return _.throttle(targetFunction, 1000, { leading: true, trailing: false });
  } else {
    return targetFunction;
  }
}
