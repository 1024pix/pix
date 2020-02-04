import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RSVP from 'rsvp';

const stubGoogleRecaptchaService = Service.extend({

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

  setupRenderingTest();

  beforeEach(function() {
    this.owner.register('service:google-recaptcha', stubGoogleRecaptchaService);
  });

  it('renders', async function() {
    await render(hbs`{{g-recaptcha}}`);
    expect(find('.gg-recaptcha')).to.exist;
  });

  // XXX Inspired of https://guides.emberjs.com/v2.13.0/tutorial/service/#toc_integration-testing-the-map-component
  it('should append recaptcha element to container element', async function() {
    // given
    const googleRecaptcha = this.owner.lookup('service:googleRecaptcha');

    // when
    await render(hbs`{{g-recaptcha}}`);

    // then
    expect(find('#g-recaptcha-container')).to.exist;
    expect(googleRecaptcha.get('calledWithContainerId')).to.equal('g-recaptcha-container');
  });

});
