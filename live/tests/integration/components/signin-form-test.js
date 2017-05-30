import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupComponentTest} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | signin form', function() {

  setupComponentTest('signin-form', {
    integration: true
  });

  const expectedEmail = 'email@example.fr';
  const expectedPassword = 'azerty';

  it('should give email and password to action given in parameter', function(done) {
    // Expect
    this.on('onSubmitAction', (email, password) => {
      expect(email).to.equal(expectedEmail);
      expect(password).to.equal(expectedPassword);
      done();
    });

    // Given
    this.render(hbs`{{signin-form onSubmit=(action 'onSubmitAction')}}`);

    _fillSigninForm(this, expectedEmail, expectedPassword);

    // When
    this.$('button[type=submit]').click();
  });

  it('should also use action on submit', function(done) {
    // Expect
    this.on('onSubmitAction', (email, password) => {
      expect(email).to.equal(expectedEmail);
      expect(password).to.equal(expectedPassword);
      done();
    });

    this.render(hbs`{{signin-form onSubmit=(action 'onSubmitAction')}}`);
    _fillSigninForm(this, expectedEmail, expectedPassword);

    // When
    this.$('.signin-form__form form').submit();
  });

  function _fillSigninForm(context, email, password) {
    context.$('#pix-email').val(email);
    context.$('#pix-email').change();

    context.$('#pix-password').val(password);
    context.$('#pix-password').change();
  }
});
