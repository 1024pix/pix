import { click, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, clickByName, clickByText } from '@1024pix/ember-testing-library';
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
      await clickByName('Mes parcours');

      // then
      assert.strictEqual(currentURL(), '/mes-parcours');
    });

    test('should open certifications page when click on menu', async function (assert) {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      await authenticateByEmail(user);

      // when
      await click('.logged-user-name');
      await clickByName('Mes certifications');

      // then
      assert.strictEqual(currentURL(), '/mes-certifications');
    });

    test('should contain link to support.pix.org/fr/support/home', async function (assert) {
      // given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      const screen = await visit('/connexion');
      await fillIn('#login', user.email);
      await fillIn('#password', user.password);
      await clickByName('Je me connecte');

      // when
      await click('.logged-user-name');
      const helplink = screen.getByRole('link', { name: 'Aide' }).getAttribute('href');

      // then
      assert.strictEqual(helplink, 'https://support.pix.org/fr/support/home');
    });

    test('should open My account page when click on menu', async function (assert) {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      await authenticateByEmail(user);

      // given
      await click('.logged-user-name');

      // when
      await clickByName('Mon compte');

      // then
      assert.strictEqual(currentURL(), '/mon-compte/informations-personnelles');
    });
  });

  test('should close menu when click outside', async function (assert) {
    // given
    server.create('campaign-participation-overview', { assessmentState: 'completed' });
    const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
    await authenticateByEmail(user);
    await click('.logged-user-name');

    // when
    await clickByText('Parcours');

    // then
    assert.dom('.logged-user-menu').doesNotExist();
  });
});
