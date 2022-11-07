import PixWindow from 'mon-pix/utils/pix-window';

export function initialize(/* applicationInstance */) {
  const currentURL = PixWindow.getLocationHref();
  const isGarAuthenticationURL = currentURL.match(/\/connexion\/gar/i)?.length === 1;

  if (isGarAuthenticationURL) {
    window.localStorage.removeItem('ember_simple_auth-session');
  }
}

export default {
  before: 'ember-simple-auth',
  initialize,
};
