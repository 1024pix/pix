import Ember from 'ember';

export const SESSION_KEY = 'pix-live.session';

export default Ember.Service.extend({

  user: null,

  init() {
    this._super(...arguments);

    let session = localStorage.getItem(SESSION_KEY);

    if (!Ember.isEmpty(session)) {
      try {
        session = JSON.parse(session);
        this.set('user', session.user);
      } catch (e) {/* istanbul ignore next */
        Ember.Logger.warn('bad session. Continuing with an empty session');
      }
    }
  },

  save() {
    const session = {
      user: this.get('user')
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  isIdentified() {
    return !Ember.isEmpty(this.get('user'));
  }

});
