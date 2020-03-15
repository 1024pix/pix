import { click, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | login-or-register-to-access-restricted-campaign', function() {

  setupApplicationTest();
  setupMirage();
  let campaign;

  beforeEach(function() {
    campaign = server.create('campaign', { isRestricted: true });
  });

  it('should contain the organization name', async function() {
    // when
    await visitWithAbortedTransition(`/campagnes/${campaign.code}/identification`);

    // then
    expect(find('.login-or-register-panel__invitation').textContent)
      .to.equal(`${campaign.organizationName} vous invite à rejoindre Pix`);
  });

  it('should contain an open register form and closed login form', async function() {
    // when
    await visitWithAbortedTransition(`/campagnes/${campaign.code}/identification`);

    // then
    expect(find('.register-form')).to.exist;
    expect(find('.login-form')).to.not.exist;
  });

  it('should open the login panel and close the register panel when clicking on login button', async function() {
    // when
    await visitWithAbortedTransition(`/campagnes/${campaign.code}/identification`);
    await click('#login-button');

    // then
    expect(find('.register-form')).to.not.exist;
    expect(find('.login-form')).to.exist;
  });

  it('should open the register panel and close the login panel when clicking on register button', async function() {
    // when
    await visitWithAbortedTransition(`/campagnes/${campaign.code}/identification`);

    await click('#login-button');
    await click('#register-button');

    // then
    expect(find('.register-form')).to.exist;
    expect(find('.login-form')).to.not.exist;
  });

});
