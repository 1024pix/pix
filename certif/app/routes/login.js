import Route from '@ember/routing/route';
// eslint-disable-next-line ember/no-mixins
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class LoginRoute extends Route.extend(UnauthenticatedRouteMixin) {
}
