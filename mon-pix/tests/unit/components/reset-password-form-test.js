import { resolve, reject } from 'rsvp';
import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

const ERROR_PASSWORD_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

const VALIDATION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

const SUBMISSION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

describe('Unit | Component | reset password form', function() {

  setupTest();

  describe('#validatePassword', () => {

    it('should set validation status to default, when component is rendered', function() {
      const component = createGlimmerComponent('component:reset-password-form');
      expect(component.validation).to.deep.equal(VALIDATION_MAP['default']);
    });

    it('should set validation status to error, when there is an validation error on password field', async function() {
      //given
      const userWithBadPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix' };
      const component = createGlimmerComponent('component:reset-password-form', { user: userWithBadPassword });

      // when
      await component.validatePassword();

      // then
      expect(component.validation).to.eql(VALIDATION_MAP['error']);
    });

    it('should set validation status to success, when password is valid', async function() {
      //given
      const userWithGoodPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix123 0 #' };
      const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

      // when
      await component.validatePassword();

      // then
      expect(component.validation).to.eql(VALIDATION_MAP['default']);
    });

  });

  describe('#handleResetPassword', () => {

    const userWithGoodPassword = EmberObject.create({
      firstName: 'toto',
      lastName: 'riri',
      password: 'Pix123 0 #',
      save: () => resolve()
    });

    describe('When user password is saved', () => {
      it('should update validation with success data', async function() {
        // given
        const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

        // when
        await component.handleResetPassword();

        // then
        expect(component.validation).to.eql(SUBMISSION_MAP['default']);
      });

      it('should update hasSucceeded', async function() {
        // given
        const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

        // when
        await component.handleResetPassword();

        // then
        expect(component.hasSucceeded).to.eql(true);
      });

      it('should reset password input', async function() {
        // given
        const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

        // when
        await component.handleResetPassword();

        // then
        expect(component.args.user.password).to.eql(null);
      });

    });

    describe('When user password saving fails', () => {

      it('should set validation with errors data', async function() {
        // given
        const userWithBadPassword = EmberObject.create({
          firstName: 'toto',
          lastName: 'riri',
          password: 'Pix',
          save: () => reject()
        });
        const component = createGlimmerComponent('component:reset-password-form', { user: userWithBadPassword });

        // when
        await component.handleResetPassword();

        // then
        expect(component.validation).to.eql(SUBMISSION_MAP['error']);
      });
    });

  });
});
