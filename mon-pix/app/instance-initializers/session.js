import PixWindow from 'mon-pix/utils/pix-window';

function _removeCurrentSessionFromLocalStorage() {
  window.localStorage.removeItem('ember_simple_auth-session');
}

export function initialize(/* applicationInstance */) {
  const currentURL = PixWindow.getLocationHref();

  const isGarAuthenticationURL = currentURL.match(/\/connexion\/gar/i)?.length === 1;
  if (isGarAuthenticationURL) {
    _removeCurrentSessionFromLocalStorage();
    return;
  }

  const isAuthenticatedExternalUser = currentURL.match(/externalUser=/i)?.length === 1;
  if (isAuthenticatedExternalUser) {
    _removeCurrentSessionFromLocalStorage();
  }
}

export default {
  before: 'ember-simple-auth',
  initialize,
};
