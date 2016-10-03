import Ember from 'ember';


export const SESSION_KEY = 'pix-live.session';

export default Ember.Service.extend({
  firstname: "",
  lastname: "",
  email: "",
  isIdentified: false,

  init() {
    this._super(...arguments);
    let session = localStorage.getItem(SESSION_KEY);
    if (!Ember.isEmpty(session)) {
      try {
        session = JSON.parse(session);
        this.setProperties({
          firstname: session.firstname,
          lastname: session.lastname,
          email: session.email,
          isIdentified: true
        });
      } catch(e) {
        Ember.Logger.warn('bad session. Continuing with an empty session');
      }
    }
  },

  save() {
    const session = this.getProperties('firstname', 'lastname', 'email');
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
});
