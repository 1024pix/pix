import Ember from 'ember';
import _ from 'lodash/lodash';

// XXX from http://stackoverflow.com/a/46181/2120773
function validateEmail(email) {

  const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regExp.test(email);
}

function getInputErrors(user) {

  const errors = [];

  if (Ember.isEmpty(user.firstName)) {
    errors.push('Vous devez saisir votre prénom.');
  }
  if (Ember.isEmpty(user.lastName)) {
    errors.push('Vous devez saisir votre nom.');
  }
  if (Ember.isEmpty(user.email) || !validateEmail(user.email)) {
    errors.push('Vous devez saisir une adresse e-mail valide.');
  }
  return errors;
}

function removeErrorMessage(component) {

  component.set('errorMessage', null);
}

function setUserInSession(component, user) {

  const session = component.get('session');
  session.set('user', user);
  session.save();
}

function callActionOnUserIdentified(component) {

  component.sendAction('onUserIdentified');
}

export default Ember.Component.extend({

  session: Ember.inject.service('session'),

  user: Ember.Object.create(),
  errorMessage: null,

  hasError: Ember.computed.notEmpty('errorMessage'),

  actions: {

    identify() {

      const user = this.get('user');

      const errors = getInputErrors(user);

      if (Ember.isEmpty(errors)) {
        removeErrorMessage(this);
        setUserInSession(this, user);
        callActionOnUserIdentified(this);
      } else {
        this.set('errorMessage', _.first(errors));
      }
    }

  }

});
