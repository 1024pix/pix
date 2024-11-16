import { getOwner, setOwner } from '@ember/application';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';

import AppInfoHandler from './request-manager-handlers/app-info-handler.js';
import AuthHandler from './request-manager-handlers/auth-handler.js';
import JsonHandler from './request-manager-handlers/json-handler.js';
import LocaleHandler from './request-manager-handlers/locale-handler.js';

/**
 * Request manager preconfigured for authenticated or not HTTP requests.
 * see: https://api.emberjs.com/ember-data/release/modules/@ember-data%2Frequest
 */
export default class RequestManagerService extends RequestManager {
  constructor(createArgs) {
    super(createArgs);

    const authHandler = new AuthHandler();
    setOwner(authHandler, getOwner(this));

    const localHandler = new LocaleHandler();
    setOwner(localHandler, getOwner(this));

    const appInfoHandler = new AppInfoHandler();
    setOwner(appInfoHandler, getOwner(this));

    const jsonHandler = new JsonHandler();
    setOwner(jsonHandler, getOwner(this));

    this.use([authHandler, localHandler, appInfoHandler, jsonHandler, Fetch]);
  }
}
