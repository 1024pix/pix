export function inferApiHost(locationObject) {

  if (/localhost/.test(locationObject.hostname)) {
    return `http://${EmberENV.apiHost.localhost}`;
  }

  if ('pix.beta.gouv.fr' === locationObject.hostname) {
    return `https://api-prod.${EmberENV.apiHost.pix}`;
  }

  if ('development.pix.beta.gouv.fr' === locationObject.hostname) {
    return `http://api-development.${EmberENV.apiHost.pix}`;
  }

  const matches = /^(.*).pix.beta.gouv.fr/.exec(locationObject.hostname);
  return `http://${matches[1]}.${EmberENV.apiHost.pix}`;
}

export function initialize() {

  EmberENV.apiHost.current = inferApiHost(window.location);
}

export default {
  name: 'infer-api-host',
  initialize
};
