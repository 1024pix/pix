import Ember from 'ember';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';

const ERROR_PASSWORD_MESSAGE = 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.';
const SUCCESS_VALIDATION_MESSAGE = 'Votre mot de passe a été bien mis à jour';

const VALIDATION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  },
  success: {
    status: 'success', message: ''
  },
};

const SUBMISSION_MAP = {
  success: {
    status: 'success', message: SUCCESS_VALIDATION_MESSAGE
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

describe('Unit | Component | reset password form', function() {

  setupComponentTest('reset-password-form', {
    needs: ['component:form-textfield'],
    unit: true
  });

  let component;

  beforeEach(function() {
    component = this.subject();
  });

  it('should be rendered', function() {
    // when
    this.render();

    // then
    expect(component).to.be.ok;
    expect(this.$()).to.have.length(1);
  });

  describe('@fullname', () => {

    it('should concatenate user first and last name', function() {
      // given
      component.set('user', Ember.Object.create({ firstName: 'Manu', lastName: 'Phillip' }));

      // when
      const fullname = component.get('fullname');

      // then
      expect(fullname).to.equal('Manu Phillip');
    });
  });

  describe('#validatePassword', () => {

    it('should set validation status to default, when component is rendered', function() {
      expect(component.get('validation')).to.eql(VALIDATION_MAP['default']);
    });

    it('should set validation status to error, when there is an validation error on password field', function() {
      //given
      const userWithBadPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix' };
      component.set('user', userWithBadPassword);

      // when
      component.send('validatePassword');

      // then
      expect(component.get('validation')).to.eql(VALIDATION_MAP['error']);
    });

    it('should set validation status to success, when password is valid', function() {
      //given
      const userWithGoodPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix123 0 #' };
      component.set('user', userWithGoodPassword);

      // when
      component.send('validatePassword');

      // then
      expect(component.get('validation')).to.eql(VALIDATION_MAP['success']);
    });

  });

  describe('#handleResetPassword', () => {

    const userWithGoodPassword = Ember.Object.create({
      firstName: 'toto',
      lastName: 'riri',
      password: 'Pix123 0 #',
      save: () => Ember.RSVP.resolve()
    });

    describe('When user password is saved', () => {
      it('should update validation with success data', function() {
        // given
        component.set('user', userWithGoodPassword);

        // when
        Ember.run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('validation')).to.eql(SUBMISSION_MAP['success']);
      });

      it('should reset paswword input', function() {
        // given
        component.set('user', userWithGoodPassword);

        // when
        Ember.run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('user.password')).to.eql(null);
      });

    });

    describe('When user password saving fails', () => {

      it('should set validation with errors data', function() {
        // given
        const userWithBadPassword = Ember.Object.create({
          firstName: 'toto',
          lastName: 'riri',
          password: 'Pix',
          save: () => Ember.RSVP.reject()
        });
        component.set('user', userWithBadPassword);

        // when
        Ember.run(() => {
          component.send('handleResetPassword');
        });

        // then
        expect(component.get('validation')).to.eql(SUBMISSION_MAP['error']);
      });
    });

  });
});
