import Route from '@ember/routing/route';

export default class UserAccountLanguageRoute extends Route {

  model() {
    return this.modelFor('user-account');
  }

}
