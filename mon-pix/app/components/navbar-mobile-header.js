import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),
  store: service(),

  classNames: ['navbar-mobile-header'],

  isUserLogged: alias('session.isAuthenticated'),

});
