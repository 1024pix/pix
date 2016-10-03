import Ember from 'ember';

export default Ember.Component.extend({

  routing: Ember.inject.service('-routing'),
  session: Ember.inject.service('session'),
  user: null,

  init() {
    this._super(...arguments);
    this.set('session.isIdentified', false);
    this.set('user', Ember.ObjectProxy.create({
      content: this.get('session'),
      errors: {}
    }));
    return this;
  },

  hasErrors: Ember.computed('user.errors.{firstname,lastname,email}', function () {
    return false === (Ember.isEmpty(this.get('user.errors.firstname'))
      && Ember.isEmpty(this.get('user.errors.lastname'))
      && Ember.isEmpty(this.get('user.errors.email')));
  }),

  isSubmitDisabled: Ember.computed('session.{firstname,lastname,email}', 'hasErrors', function () {
    return (
      Ember.isEmpty(this.get('session.firstname'))
      || Ember.isEmpty(this.get('session.lastname'))
      || Ember.isEmpty(this.get('session.email'))
      || this.get('hasErrors')
    );
  }),

  actions: {
    identify() {
      this.set('session.isIdentified', true);
      this.get('session').save();
      this.get('routing').transitionTo('home');
    },

    update(object, propertyPath, value) {
      if (Ember.isEmpty(value)) {
        this.set(`user.errors.${propertyPath}`, ['Champ requis']);
        return;
      }

      this.set(`user.errors.${propertyPath}`, null);

      if (propertyPath === 'email' && false === $('.email_input')[0].checkValidity()) {
        this.set('user.errors.email', ['Entrez un email correct']);
        return;
      }

      object.set(propertyPath, value);
    }
  }

});
