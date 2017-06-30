import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import RSVP from 'rsvp';

const StubGoogleRecaptchaService = Ember.Service.extend({

  loadScript() {
    return RSVP.resolve();
  },

  // XXX Due to Google reCAPTCHA, we can not assert that callback and expiredCallback are well set.
  render(containerId /* , callback, expiredCallback  */) {
    this.set('calledWithContainerId', containerId);
    // We create a div here to simulate our Google recaptcha service,
    // which will create and then cache the recaptcha element
    const container = document.getElementById(containerId);
    const recaptchaElement = document.createElement('div');
    return container.appendChild(recaptchaElement);
  },

  reset() {

  }
});

describe('Integration | Component | g recaptcha', function() {

  setupComponentTest('g-recaptcha', {
    integration: true
  });

  beforeEach(function() {
    this.register('service:google-recaptcha', StubGoogleRecaptchaService);
    this.inject.service('google-recaptcha', { as: 'googleRecaptchaService' });
  });

  it('renders', function() {
    this.render(hbs`{{g-recaptcha}}`);
    expect(this.$()).to.have.length(1);
  });

  // XXX Inspired of https://guides.emberjs.com/v2.13.0/tutorial/service/#toc_integration-testing-the-map-component
  it('should append recaptcha element to container element', function() {
    // when
    this.render(hbs`{{g-recaptcha}}`);
    // then
    expect(this.$('#g-recaptcha-container').children()).to.have.lengthOf(1);
    expect(this.get('googleRecaptchaService.calledWithContainerId')).to.equal('g-recaptcha-container');
  });

});
