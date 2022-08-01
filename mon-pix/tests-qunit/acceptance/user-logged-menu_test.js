import { click, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { clickByLabel } from '../helpers/click-by-label';
import findByLabel from '../helpers/find-by-label';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | User account', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  hooks.beforeEach(async function () {
    //given
    server.create('campaign-participation-overview', { assessmentState: 'completed' });
    user = server.create('user', 'withEmail', 'withAssessmentParticipations');
    await authenticateByEmail(user);
  });

  module('When in profile', function () {
    test('should open tests page when click on menu', async function (assert) {
      // when
      await click('.logged-user-name');
      await clickByLabel('Mes parcours');

      // then
      assert.equal(currentURL(), '/mes-parcours');
    });

    test('should open certifications page when click on menu', async function (assert) {
      // when
      await click('.logged-user-name');
      await clickByLabel('Mes certifications');

      // then
      assert.equal(currentURL(), '/mes-certifications');
    });

    test('should contain link to support.pix.org/fr/support/home', async function (assert) {
      // when
      await click('.logged-user-name');
      const helplink = findByLabel('Aide').getAttribute('href');

      // then
      assert.equal(helplink, 'https://support.pix.org/fr/support/home');
    });

    test('should open My account page when click on menu', async function (assert) {
      // given
      await click('.logged-user-name');

      // when
      await clickByLabel('Mon compte');

      // then
      assert.equal(currentURL(), '/mon-compte/informations-personnelles');
    });
  });
});
