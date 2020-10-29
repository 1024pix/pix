// eslint-disable-next-line ember/no-mixins
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import Route from '@ember/routing/route';

export default class LoginRoute extends Route.extend(UnauthenticatedRouteMixin) {

  routeIfAlreadyAuthenticated = 'authenticated';
}
