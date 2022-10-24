import Route from '@ember/routing/route';

export default class JoinRoute extends Route {
  model() {
    return {
      certificationCenterName: 'PLACEHOLDER_CERTIF_CENTER_NAME',
    };
  }
}
