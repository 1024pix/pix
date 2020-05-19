import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  click,
  fillIn,
  render,
  triggerEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | signin form', function() {

  setupRenderingTest();

  describe('Rendering', async function() {

    it('should display an input for identifiant field', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('input#login')).to.exist;
    });

    it('should display an input for password field', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('input#password')).to.exist;
    });

    it('should display a submit button to authenticate', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('button.button')).to.exist;
    });

    it('should display a link to password reset view', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('a.sign-form-body__forgotten-password-link')).to.exist;
    });

    it('should not display any error by default', async function() {
      // when
      await render(hbs`<SigninForm />`);

      // then
      expect(document.querySelector('div.sign-form__notification-message')).to.not.exist;
    });

    it('should display an error if authentication failed', async function() {
      // given
      this.set('authenticateUser', sinon.stub().rejects());
      await render(hbs`<SigninForm @authenticateUser={{this.authenticateUser}} />`);

      // when
      await click('button.button');

      // then
      expect(document.querySelector('div.sign-form__notification-message--error')).to.exist;
    });
  });

  describe('Behaviours', function() {

    it('should authenticate user when she submitted sign-in form', async function() {
      // given
      const expectedEmail = 'email@example.fr';
      const expectedPassword = 'azerty';

      this.set('onSubmitAction', function(email, password) {
        // then
        expect(email).to.equal(expectedEmail);
        expect(password).to.equal(expectedPassword);
        return Promise.resolve();
      });

      await render(hbs`<SigninForm @authenticateUser={{this.onSubmitAction}} />`);

      await fillIn('input#login', expectedEmail);
      await triggerEvent('input#login', 'change');
      await fillIn('input#password', expectedPassword);
      await triggerEvent('input#password', 'change');

      // when
      await click('button.button');
    });

  });
});
