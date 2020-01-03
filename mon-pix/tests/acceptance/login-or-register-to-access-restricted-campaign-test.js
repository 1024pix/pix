import { click, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | login-or-register-to-access-restricted-campaign', function() {

  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  it('should contain an open register form and closed login form', async function() {
    // when
    await visitWithAbortedTransition('/campagnes/AZERTY1/identification');

    // then
    expect(find('.register-form')).to.exist;
    expect(find('.login-form')).to.not.exist;
  });

  it('should open the login panel and close the register panel when clicking on login button', async function() {
    // when
    await visitWithAbortedTransition('/campagnes/AZERTY1/identification');
    await click('#login');

    // then
    expect(find('.register-form')).to.not.exist;
    expect(find('.login-form')).to.exist;
  });

  it('should open the register panel and close the login panel when clicking on register button', async function() {
    // when
    await visitWithAbortedTransition('/campagnes/AZERTY1/identification');

    await click('#login');
    await click('#register');

    // then
    expect(find('.register-form')).to.exist;
    expect(find('.login-form')).to.not.exist;
  });

});
