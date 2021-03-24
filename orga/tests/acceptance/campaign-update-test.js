import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Update', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
  });

  test('it should allow to update a campaign and redirect to the newly updated campaign', async function(assert) {
    // given
    const campaign = server.create('campaign', { id: 1 });
    const newName = 'New Name';
    const newText = 'New text';

    await visit(`/campagnes/${campaign.id}/modification`);
    await fillInByLabel('Nom de la campagne', newName);
    await fillInByLabel('Texte de la page d\'accueil', newText);

    // when
    await clickByLabel('Modifier');

    // then
    assert.equal(server.db.campaigns.find(1).name, newName);
    assert.equal(server.db.campaigns.find(1).customLandingPageText, newText);
    assert.equal(currentURL(), '/campagnes/1');
  });
});
