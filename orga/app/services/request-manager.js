import { getOwner, setOwner } from '@ember/application';
import { Fetch, RequestManager } from '@warp-drive/core';

import AppInfoHandler from './request-manager-handlers/app-info-handler.js';
import AuthHandler from './request-manager-handlers/auth-handler.js';
import JsonHandler from './request-manager-handlers/json-handler.js';

/**
 * Request manager preconfigured for authenticated or not HTTP requests.
 * see: https://api.emberjs.com/ember-data/release/modules/@warp-drive/legacy%2Frequest
 */
export default class RequestManagerService extends RequestManager {
  constructor(createArgs) {
    super(createArgs);

    const authHandler = new AuthHandler();
    setOwner(authHandler, getOwner(this));

    const appInfoHandler = new AppInfoHandler();
    setOwner(appInfoHandler, getOwner(this));

    const jsonHandler = new JsonHandler();
    setOwner(jsonHandler, getOwner(this));

    this.use([authHandler, appInfoHandler, jsonHandler, Fetch]);
  }
}
