import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createAdmin, createMember, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should show campaign title', async function (assert) {
    // given
    const { user } = createAdmin();
    createPrescriberByUser(user);
    await authenticateSession(user.id);
    const campaign = server.create('campaign', { id: 1, name: 'Super Campagne', ownerId: user.id });

    // when
    const screen = await visitScreen(`/campagnes/${campaign.id}/modification`);

    // then
    assert.dom(screen.getByText('Super Campagne')).exists();
  });

  module('when user is ADMIN', function () {
    test('it should allow to update a campaign and redirect to the newly updated campaign', async function (assert) {
      // given
      const { user } = createAdmin();
      createPrescriberByUser(user);
      await authenticateSession(user.id);
      const campaign = server.create('campaign', { id: 1, ownerId: user.id });
      const newName = 'New Name';
      const newText = 'New text';

      await visitScreen(`/campagnes/${campaign.id}/modification`);
      await fillByLabel('* Nom de la campagne', newName);
      await fillByLabel("Texte de la page d'accueil", newText);

      // when
      await clickByName('Modifier');

      // then
      assert.strictEqual(server.db.campaigns.find(1).name, newName);
      assert.strictEqual(server.db.campaigns.find(1).customLandingPageText, newText);
      assert.strictEqual(currentURL(), '/campagnes/1/parametres');
    });
  });

  module('when user is a MEMBER and owner of the campaign', function () {
    test('it should allow to see update campaign page', async function (assert) {
      // given
      const { user } = createMember();
      await authenticateSession(user.id);
      const campaign = server.create('campaign', { id: 1, name: 'Campagne des champs', ownerId: user.id });

      // when
      await visitScreen(`/campagnes/${campaign.id}/modification`);

      // then
      assert.strictEqual(currentURL(), '/campagnes/1/modification');
    });
  });

  module('when user is a MEMBER and not own the campaign', function () {
    test('it should not allow to see update campaign page', async function (assert) {
      // given
      const otherUserId = server.create('user').id;
      const { user } = createMember();
      await authenticateSession(user.id);
      const campaign = server.create('campaign', { id: 1, ownerId: otherUserId });

      // when
      const screen = await visitScreen(`/campagnes/${campaign.id}/parametres`);

      // then
      assert.dom(screen.queryByLabelText('Modifier')).doesNotExist();
    });

    test('it should redirect user to his campaigns', async function (assert) {
      // given
      const otherUserId = server.create('user').id;
      const { user } = createMember();
      await authenticateSession(user.id);
      const campaign = server.create('campaign', { id: 1, ownerId: otherUserId });

      // when
      await visitScreen(`/campagnes/${campaign.id}/modification`);

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });
  });
});
