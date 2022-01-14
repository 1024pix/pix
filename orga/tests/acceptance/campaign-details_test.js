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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function () {
    test('it should redirect to campaign list on click on return button', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);

      server.create('campaign', { id: 1 });
      server.create('campaign-participant-activity', { firstName: 'toto' });
      await visit('/campagnes/1');

      // when
      await clickByName('Retour');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/campagnes/les-miennes');
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
