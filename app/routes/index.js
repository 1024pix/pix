import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return [
      { firstName: 'John', lastName: 'Doe', email: 'jdoe@mail.com' },
      { firstName: 'Bruce', lastName: 'Wayne', email: 'jdoe@mail.com' },
      { firstName: 'Clara', lastName: 'Masoero', email: 'cmasoero' }
    ];
  }
});
