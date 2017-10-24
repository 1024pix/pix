import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
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
      return Promise.resolve();
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
      return Promise.resolve();
    });

    this.render(hbs`{{signin-form onSubmit=(action 'onSubmitAction')}}`);
    _fillSigninForm(this, expectedEmail, expectedPassword);

    // When
    this.$('.signin-form__form form').submit();
  });

  it('should display an error', function() {
    // Expect
    this.on('onSubmitAction', () => {
      return Promise.resolve();
    });

    this.render(hbs`{{signin-form onSubmit=(action 'onSubmitAction')}}`);
    _fillSigninForm(this, expectedEmail, expectedPassword);

    // When
    this.$('.signin-form__form form').submit();

    // Then
    expect(this.$('.signin-form__errors')).to.have.length(0);
  });

  it('should hide the error message if it was previously displayed', function() {
    // Expect
    this.on('onSubmitAction', () => {
      return Promise.resolve();
    });
    this.render(hbs`{{signin-form onSubmit=(action 'onSubmitAction') displayErrorMessage='true'}}`);

    expect(this.$('.signin-form__errors')).to.have.length(1);
    _fillSigninForm(this, expectedEmail, expectedPassword);

    // When
    this.$('.signin-form__form form').submit();

    // Then
    expect(this.$('.signin-form__errors')).to.have.length(0);
  });

  function _fillSigninForm(context, email, password) {
    context.$('#pix-email').val(email);
    context.$('#pix-email').change();

    context.$('#pix-password').val(password);
    context.$('#pix-password').change();
  }
});
