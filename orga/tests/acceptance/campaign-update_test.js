import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
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
    assert.equal(server.db.campaigns.find(1).name, newName);
    assert.equal(server.db.campaigns.find(1).customLandingPageText, newText);
    assert.equal(currentURL(), '/campagnes/1/parametres');
  });
});
