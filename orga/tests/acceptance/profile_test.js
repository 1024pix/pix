import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { clickByName } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Profile', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    await authenticateSession(user.id);
  });

  test('it allows user to return to campaign activity page', async function (assert) {
    server.create('campaign', { id: 1 });
    server.create('campaignProfile', { campaignId: 1, campaignParticipationId: 1 });

    // when
    await visit('/campagnes/1/profils/1');
    await clickByName('Retour');

    // then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), '/campagnes/1');
  });

  test('it display profile information', async function (assert) {
    server.create('campaign', { id: 2 });
    server.create('campaignProfile', {
      campaignId: 2,
      campaignParticipationId: 1,
      firstName: 'Jules',
      lastName: 'Winnfield',
    });

    // when
    await visit('/campagnes/2/profils/1');

    // then
    assert.contains('Jules Winnfield');
  });
});
