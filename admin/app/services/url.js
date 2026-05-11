import Location from 'pix-admin/utils/location';

import UrlBaseService from './url-base.js';

export default class Url extends UrlBaseService {
  getApplicationHost(applicationName, applicationTld) {
    const { host } = new URL(Location.getHref());
    const hostWithoutApplicationNorTld = host.split('.').slice(1, -1).join('.');
    return `${applicationName}.${hostWithoutApplicationNorTld}${applicationTld}`;
  }
}
