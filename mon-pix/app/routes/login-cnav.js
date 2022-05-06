import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

export default class LoginCnavRoute extends Route {
  @service session;
  @service router;
  @service location;

  get redirectUri() {
    const { protocol, host } = location;
    const path = this.router.urlFor(this.routeName);
    return `${protocol}//${host}${path}`;
  }

  beforeModel(transition) {
    const queryParams = transition.to ? transition.to.queryParams : transition.queryParams;
    if (!queryParams.code && queryParams.error) {
      return this.replaceWith('login');
    }

    if (!queryParams.code && !queryParams.error) {
      return this._handleRedirectRequest();
    }
  }

  async model(_, transition) {
    const queryParams = transition.to ? transition.to.queryParams : transition.queryParams;
    if (queryParams.code) {
      return this._handleCallbackRequest(queryParams.code, queryParams.state);
    }
  }

  afterModel({ shouldValidateCgu, authenticationKey } = {}) {
    if (shouldValidateCgu && authenticationKey) {
      return this.replaceWith('terms-of-service-cnav', { queryParams: { authenticationKey } });
    }
  }

  async _handleCallbackRequest(code, state) {
    try {
      await this.session.authenticate('authenticator:cnav', {
        code,
        redirectUri: this.redirectUri,
        state,
      });
    } catch (response) {
      const shouldValidateCgu = get(response, 'errors[0].code') === 'SHOULD_VALIDATE_CGU';
      const authenticationKey = get(response, 'errors[0].meta.authenticationKey');
      if (shouldValidateCgu && authenticationKey) {
        return { shouldValidateCgu, authenticationKey };
      }
      throw new Error(JSON.stringify(response.errors));
    } finally {
      this.session.set('data.state', undefined);
      this.session.set('data.nonce', undefined);
    }
  }

  async _handleRedirectRequest() {
    const response = await fetch(
      `${ENV.APP.API_HOST}/api/cnav/auth-url?redirect_uri=${encodeURIComponent(this.redirectUri)}`
    );

    const { redirectTarget, state, nonce } = await response.json();
    this.session.set('data.state', state);
    this.session.set('data.nonce', nonce);
    this.location.replace(redirectTarget);
  }
}
