import { click, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { clickByLabel } from '../helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';

module('Acceptance | User account', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When in profile', function () {
    test('should open tests page when click on menu', async function (assert) {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      await authenticateByEmail(user);

      // when
      await click('.logged-user-name');
      await clickByLabel('Mes parcours');

      // then
      assert.equal(currentURL(), '/mes-parcours');
    });

    test('should open certifications page when click on menu', async function (assert) {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      await authenticateByEmail(user);

      // when
      await click('.logged-user-name');
      await clickByLabel('Mes certifications');

      // then
      assert.equal(currentURL(), '/mes-certifications');
    });

    test('should contain link to support.pix.org/fr/support/home', async function (assert) {
      // given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      const screen = await visit('/connexion');
      await fillIn('#login', user.email);
      await fillIn('#password', user.password);
      await clickByLabel('Je me connecte');

      // when
      await click('.logged-user-name');
      const helplink = screen.getByRole('link', { name: 'Aide' }).getAttribute('href');

      // then
      assert.equal(helplink, 'https://support.pix.org/fr/support/home');
    });

    test('should open My account page when click on menu', async function (assert) {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      await authenticateByEmail(user);

      // given
      await click('.logged-user-name');

      // when
      await clickByLabel('Mon compte');

      // then
      assert.equal(currentURL(), '/mon-compte/informations-personnelles');
    });
  });
});
