import { helper } from '@ember/component/helper';
import ENV from 'mon-pix/config/environment';

export function getHomeHost() {
  let HOME_HOST = '/';
  if (ENV.environment === 'production' && location.host.endsWith('app.pix.fr')) {
    HOME_HOST = 'https://pix.fr';
  }
  return HOME_HOST;

}

export default helper(getHomeHost);
