import { resolve, reject } from 'rsvp';
import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import setupIntl from 'mon-pix/tests/helpers/setup-intl';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | reset password form', function() {

  setupTest();
  setupIntl();

  describe('#validatePassword', () => {

    it('should set validation status to default, when component is rendered', function() {
      const component = createGlimmerComponent('component:reset-password-form');
      expect(component.validation.status).to.equal('default');
    });

    it('should set validation status to error, when there is an validation error on password field', async function() {
      //given
      const userWithBadPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix' };
      const component = createGlimmerComponent('component:reset-password-form', { user: userWithBadPassword });

      // when
      await component.validatePassword();

      // then
      expect(component.validation.status).to.eql('error');
    });

    it('should set validation status to default, when password is valid', async function() {
      //given
      const userWithGoodPassword = { firstName: 'toto', lastName: 'riri', password: 'Pix123 0 #' };
      const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

      // when
      await component.validatePassword();

      // then
      expect(component.validation.status).to.eql('default');
    });

  });

  describe('#handleResetPassword', () => {

    const userWithGoodPassword = EmberObject.create({
      firstName: 'toto',
      lastName: 'riri',
      password: 'Pix123 0 #',
      save: () => resolve(),
    });

    describe('When user password is saved', () => {

      it('should update validation with success data', async function() {
        // given
        const component = createGlimmerComponent('component:reset-password-form', { user: userWithGoodPassword });

        // when
        await component.handleResetPassword();

        // then
        expect(component.validation.status).to.eql('default');
        expect(component.validation.message).to.be.null;
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

      [
        {
          status: '400',
          message: 'pages.reset-password.error.wrong-format',
        },
        {
          status: '403',
          message: 'pages.reset-password.error.forbidden',
        },
        {
          status: '404',
          message: 'pages.reset-password.error.expired-demand',
        },
        {
          status: '500',
          message: 'api-error-messages.internal-server-error',
        },
      ].forEach((testCase) => {
        it(`it should display ${testCase.message} when http status is ${testCase.status}`, async () => {
          // given
          const userWithBadPassword = EmberObject.create({
            firstName: 'toto',
            lastName: 'riri',
            password: 'Pix',
            save: () => reject({ errors: [{ status: testCase.status }] }),
          });
          const component = createGlimmerComponent('component:reset-password-form', { user: userWithBadPassword });

          // when
          await component.handleResetPassword();

          // then
          expect(component.validation.status).to.eql('error');
          expect(component.validation.message).to.eql(component.intl.t(testCase.message));
        });
      });
    });
  });
});
