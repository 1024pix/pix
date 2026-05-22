import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';
import ENV from 'pix-orga/config/environment';

import Location from '../../../utils/location';
import { SessionStorageEntry } from '../../../utils/session-storage-entry';

const oidcUserAuthenticationStorage = new SessionStorageEntry('oidcUserAuthentication');

export default class LoginOidcRoute extends Route {
  @service intl;
  @service oidcIdentityProviders;
  @service router;
  @service session;
  @service joinInvitation;

  async beforeModel(transition) {
    const queryParams = transition.to.queryParams;
    if (queryParams.error) {
      throw queryParams.error;
    }

    const identityProviderSlug = transition.to.params.identity_provider_slug;
    const identityProvider = this.oidcIdentityProviders.findBySlug(identityProviderSlug);
    if (!identityProvider) {
      this.router.transitionTo('authentication.login');
      return;
    }

    // Preventing OIDC authentication replay errors when doing history back and reload
    // when the user is already authenticated with the same OIDC Provider.
    if (this.session.isAuthenticated) {
      if (identityProvider.code == this.session.data.authenticated.identityProviderCode) {
        this.router.transitionTo('authenticated');
        return;
      }
    }

    if (!queryParams.code) {
      transition.abort();
      await this._makeOidcAuthenticationRequest(identityProvider);
    }
  }

  async model(params, transition) {
    const { code, state, iss } = transition.to.queryParams;
    const identityProviderSlug = params.identity_provider_slug;
    const identityProvider = this.oidcIdentityProviders.findBySlug(identityProviderSlug);

    const model = await this._handleOidcCallbackRequest({ identityProvider, code, state, iss });
    return model;
  }

  redirect(model) {
    const { identityProviderSlug, shouldCreateUserAccount } = model;

    if (shouldCreateUserAccount) {
      if (this.joinInvitation.invitation) {
        this.router.transitionTo('authentication.oidc.signup', identityProviderSlug);
      } else {
        this.router.transitionTo('authentication.oidc.login', identityProviderSlug);
      }
    }
  }

  async _makeOidcAuthenticationRequest(identityProvider) {
    this.session.set('data.nextURL', undefined);

    // Storing the `attemptedTransition` in the localstorage so that when the user returns after
    // the login he can be sent to the initial destination.
    if (this.session.get('attemptedTransition')) {
      // cf. https://github.com/tildeio/router.js/blob/master/ARCHITECTURE.md#transitionintent
      // there are 2 types of TransitionIntents:
      // - URLTransitionIntent: for example when the route is accessed by url (/campagnes/:code), the url is provided
      // - NamedTransitionIntent: for example when the route is accessed by the submit of the campaign code
      //   the route name (organizations.access) and contexts ([Campaign]) are provided.
      const { url, name, contexts } = this.session.get('attemptedTransition.intent');
      let nextURL;
      if (url) {
        nextURL = url;
      } else {
        if (contexts[0]) {
          nextURL = this.router.urlFor(name, contexts[0]);
        } else {
          nextURL = this.router.urlFor(name);
        }
      }

      this.session.set('data.nextURL', nextURL);
    }

    try {
      const response = await fetch(
        `${ENV.APP.API_HOST}/api/oidc/authorization-url?identity_provider=${identityProvider.code}`,
      );
      if (response.status != 200) throw response;

      const { redirectTarget: authorizationUrl } = await response.json();
      Location.assign(authorizationUrl);
    } catch {
      this.oidcIdentityProviders.isOidcProviderAuthenticationInProgress = false;

      // TODO: Here it would be nice to display an explanation message for the user
      this.router.transitionTo('authentication.login');
    }
  }

  async _handleOidcCallbackRequest({ identityProvider, code, state, iss }) {
    const identityProviderSlug = identityProvider.slug;
    try {
      await this.session.authenticate('authenticator:oidc', {
        code,
        state,
        iss,
        identityProviderSlug,
        hostSlug: 'token',
      });

      return { identityProviderSlug, shouldCreateUserAccount: false };
    } catch (response) {
      const apiError = get(response, 'errors[0]');
      if (!apiError) {
        throw response;
      }

      if (apiError.code == 'MISSING_OIDC_STATE') {
        this.router.transitionTo('authentication.login');
        return;
      }

      const shouldValidateCgu = apiError.code === 'SHOULD_VALIDATE_CGU';
      if (shouldValidateCgu && apiError.meta.authenticationKey) {
        oidcUserAuthenticationStorage.set(apiError.meta);

        return { identityProviderSlug, shouldCreateUserAccount: true };
      }

      throw apiError;
    }
  }
}
