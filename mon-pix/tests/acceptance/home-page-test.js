import { click, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { authenticateAsSimpleExternalUser, authenticateAsSimpleUser } from '../helpers/testing';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Home page', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  it('should show shared profile button when user is not external user', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    await visitWithAbortedTransition('/compte');

    // then
    expect(find('.share-profile__share-button')).to.exist;
  });

  it('should not show the shared profile button when user is external user', async function() {
    // given
    await authenticateAsSimpleExternalUser();

    // when
    await visitWithAbortedTransition('/compte');

    // then
    expect(find('.share-profile__share-button')).to.not.exist;
  });

  it('should redirect to profil when user clicks on profil link', async function() {
    // given
    this.server.create('assessment', {
      id: 2,
      type: 'SMART_PLACEMENT',
      state: 'completed',
    });
    this.server.create('campaign-participation', {
      id: 1,
      isShared: false,
      campaignId: 1,
      assessmentId: 2,
      userId: 1,
    });
    await authenticateAsSimpleUser();
    await visitWithAbortedTransition('/compte');

    // when
    await click('.results-warning__link');

    // then
    expect(currentURL()).to.equal('/profil');
  });

});
