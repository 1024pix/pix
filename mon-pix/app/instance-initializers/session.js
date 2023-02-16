import PixWindow from 'mon-pix/utils/pix-window';

const EMBER_SIMPLE_AUTH_LOCALSTORAGE_KEY = 'ember_simple_auth-session';

export function initialize(/* applicationInstance */) {
  const currentURL = PixWindow.getLocationHref();

  const isGarAuthenticationURL = currentURL.includes('/connexion/gar');
  const isAuthenticatedExternalUser = currentURL.includes('externalUser=');
  const isCampaignURL = currentURL.includes('/campagnes');
  const isSimplifiedAccess = isCampaignURL && _isAnonymousUserAuthenticated();
  const shouldRemoveCurrentSessionFromLocalStorage =
    isGarAuthenticationURL || isAuthenticatedExternalUser || isSimplifiedAccess;

  if (shouldRemoveCurrentSessionFromLocalStorage) {
    _removeCurrentSessionFromLocalStorage();
  }
}

function _isAnonymousUserAuthenticated() {
  try {
    const emberSimpleAuthSession = JSON.parse(window.localStorage.getItem(EMBER_SIMPLE_AUTH_LOCALSTORAGE_KEY));
    return emberSimpleAuthSession.authenticated?.authenticator === 'authenticator:anonymous';
  } catch (error) {
    return false;
  }
}

function _removeCurrentSessionFromLocalStorage() {
  window.localStorage.removeItem(EMBER_SIMPLE_AUTH_LOCALSTORAGE_KEY);
}

export default {
  before: 'ember-simple-auth',
  initialize,
};
