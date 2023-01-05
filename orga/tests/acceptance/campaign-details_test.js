import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // given
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function () {
    test('it should redirect to campaign list on click on return button by default', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);

      server.create('campaign', { id: 1 });
      await visit('/campagnes/1');

      // when
      await clickByName('Retour');

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });

    test('it should redirect to all campaigns list on click on return button if coming from all campaigns', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);

      server.create('campaign', { id: 1, name: 'CampagneEtPrairie' });
      await visit('/campagnes/toutes');
      await clickByName('CampagneEtPrairie');

      // when
      await clickByName('Retour');

      // then
      assert.strictEqual(currentURL(), '/campagnes/toutes');
    });

    test('it should redirect to my campaigns list on click on return button if coming from my campaigns', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);

      server.create('campaign', { id: 1, name: 'CampagneEtPrairie', ownerId: user.id });
      await visit('/campagnes/les-miennes');
      await clickByName('CampagneEtPrairie');

      // when
      await clickByName('Retour');

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });

    test('[A11Y] it should contain accessibility aria-label nav', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);

      server.create('campaign', { id: 1 });
      server.create('campaign-participant-activity', { firstName: 'toto' });

      // when
      const screen = await visitScreen('/campagnes/1');

      // then
      assert.dom(screen.getByLabelText('Navigation principale')).exists();
      assert.dom(screen.getByLabelText("Navigation de la section détails d'une campagne")).exists();
      assert.dom(screen.getByLabelText('Navigation de pied de page')).exists();
    });
  });
});
