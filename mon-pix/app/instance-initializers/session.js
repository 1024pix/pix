import PixWindow from 'mon-pix/utils/pix-window';

export function initialize(/* applicationInstance */) {
  const currentURL = PixWindow.getLocationHref();

  const isGarAuthenticationURL = currentURL.includes('/connexion/gar');
  const isAuthenticatedExternalUser = currentURL.includes('externalUser=');

  if (isGarAuthenticationURL || isAuthenticatedExternalUser) {
    _removeCurrentSessionFromLocalStorage();
  }
}

function _removeCurrentSessionFromLocalStorage() {
  window.localStorage.removeItem('ember_simple_auth-session');
}

export default {
  before: 'ember-simple-auth',
  initialize,
};
