import PixWindow from 'pix-certif/utils/pix-window';

export function initialize(/* applicationInstance */) {
  const location = PixWindow.getLocation();
  const isJoinRoute = !!location.pathname.match(/^\/rejoindre/);

  if (isJoinRoute) {
    window.localStorage.removeItem('ember_simple_auth-session');
  }
}

export default {
  initialize,
};
