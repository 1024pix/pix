import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';
import { authenticateAsSimpleExternalUser, authenticateAsSimpleUser } from '../helpers/testing';

describe('Acceptance | Home page', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should show shared profile button when user is not external user', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    await visit('/compte');

    // then
    findWithAssert('.share-profile__share-button');
  });

  it('should not show the shared profile button when user is external user', async function() {
    // given
    await authenticateAsSimpleExternalUser();

    // when
    await visit('/compte');

    // then
    expect(find('.share-profile__share-button')).to.have.lengthOf(0);
  });

  it('should redirect to profil-v2 when user clicks on profil-v2 link', async function() {
    // given
    server.create('assessment', {
      id: 2,
      type: 'SMART_PLACEMENT',
      state: 'completed',
    });
    server.create('campaign-participation', {
      id: 1,
      isShared: false,
      campaignId: 1,
      assessmentId: 2,
      userId: 1,
    });
    await authenticateAsSimpleUser();
    await visit('/compte');

    // when
    await click('.results-warning__link');

    // then
    expect(currentURL()).to.equal('/profil-v2');
  });

});
