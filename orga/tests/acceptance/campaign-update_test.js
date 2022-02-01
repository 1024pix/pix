import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    await authenticateSession(user.id);
  });

  test('it should allow to update a campaign and redirect to the newly updated campaign', async function (assert) {
    // given
    const campaign = server.create('campaign', { id: 1 });
    const newName = 'New Name';
    const newText = 'New text';

    await visit(`/campagnes/${campaign.id}/modification`);
    await fillByLabel('* Nom de la campagne', newName);
    await fillByLabel("Texte de la page d'accueil", newText);

    // when
    await clickByName('Modifier');

    // then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(server.db.campaigns.find(1).name, newName);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(server.db.campaigns.find(1).customLandingPageText, newText);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), '/campagnes/1/parametres');
  });

  test('it should show campaign title', async function (assert) {
    // given
    const campaign = server.create('campaign', { id: 1, name: 'Super Campagne' });

    // when
    const screen = await visitScreen(`/campagnes/${campaign.id}/modification`);

    // then
    assert.dom(screen.getByText('Super Campagne')).exists();
  });
});
