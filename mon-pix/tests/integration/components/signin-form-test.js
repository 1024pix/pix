import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

describe('Integration | Component | signin form', function() {

  setupComponentTest('signin-form', {
    integration: true
  });

  describe('Rendering', function() {

    it('should display an input for email field', function() {
      // when
      this.render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('input#pix-email')).to.exist;
    });

    it('should display an input for password field', function() {
      // when
      this.render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('input#pix-password')).to.exist;
    });

    it('should display a submit button to authenticate', function() {
      // when
      this.render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('button.signin-form__submit_button')).to.exist;
    });

    it('should display a link to password reset view', function() {
      // when
      this.render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('a.signin-form__forgotten-password-link')).to.exist;
    });

    it('should not display any error by default', function() {
      // when
      this.render(hbs`{{signin-form}}`);

      // then
      expect(document.querySelector('div.signin-form__errors')).to.not.exist;
    });

    it('should display an error if authentication failed', function() {
      // given
      this.set('displayErrorMessage', true);

      // when
      this.render(hbs`{{signin-form displayErrorMessage=displayErrorMessage}}`);

      // then
      expect(document.querySelector('div.signin-form__errors')).to.exist;
    });
  });

  describe('Behaviours', function() {

    it('should authenticate user when she submitted sign-in form', function() {
      // given
      const expectedEmail = 'email@example.fr';
      const expectedPassword = 'azerty';

      this.on('onSubmitAction', function(email, password) {
        // then
        expect(email).to.equal(expectedEmail);
        expect(password).to.equal(expectedPassword);
        return Promise.resolve();
      });

      this.render(hbs`{{signin-form onSubmit=(action 'onSubmitAction')}}`);

      this.$('input#pix-email').val(expectedEmail);
      this.$('input#pix-email').change();
      this.$('input#pix-password').val(expectedPassword);
      this.$('input#pix-password').change();

      // when
      run(() => document.querySelector('button.signin-form__submit_button').click());
    });

  });
});
