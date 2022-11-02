import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { currentURL } from '@ember/test-helpers';

module('Acceptance | Badges | Badge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/target-profiles/1/badges/2');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function (hooks) {
    let badge;
    hooks.beforeEach(async function () {
      const targetProfile = this.server.create('target-profile', { id: 1 });
      const criterionCampaignParticipation = this.server.create('badge-criterion', {
        id: 123,
        scope: 'CampaignParticipation',
        threshold: 50,
        skillSets: [],
        cappedTubes: [],
      });
      const criterionCappedTubes = this.server.create('badge-criterion', {
        id: 456,
        scope: 'CappedTubes',
        threshold: 100,
        skillSets: [],
        cappedTubes: [],
      });
      badge = this.server.create('badge', {
        id: 2,
        title: 'My badge',
        imageUrl: 'https://images.pix/fr/badges/AG2R.svg',
        isCertifiable: true,
        isAlwaysVisible: true,
        criteria: [criterionCampaignParticipation, criterionCappedTubes],
      });
      targetProfile.update({ badges: [badge] });
    });

    module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      });

      test('it should be accessible for an authenticated user', async function (assert) {
        // when
        await visit('/target-profiles/1/badges/2');

        // then
        assert.strictEqual(currentURL(), '/target-profiles/1/badges/2');
      });

      test('should display the badge details', async function (assert) {
        // when
        const screen = await visit('/target-profiles/1/badges/2');

        // then
        assert.dom(screen.getByText('Nom du résultat thématique : My badge', { exact: false })).exists();
        assert.dom(screen.getByText('AG2R.svg', { exact: false })).exists();
        assert.dom(screen.getByText('Certifiable')).exists();
        assert.dom(screen.getByText('Lacunes')).exists();
        assert.deepEqual(
          screen.getByTestId('triste').innerText,
          'L‘évalué doit obtenir 50% sur l‘ensemble des acquis du profil-cible.'
        );
        assert.deepEqual(
          screen.getByTestId('toujourstriste').innerText,
          "L'évalué doit obtenir 100% sur tous les sujets plafonnés par niveau suivants :"
        );
      });
    });

    module('when admin member has role "CERTIF"', function () {
      test('it should be redirect to Organizations page', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);

        // when
        await visit('/target-profiles/1/badges/2');

        // then
        assert.strictEqual(currentURL(), '/organizations/list');
      });
    });
  });
});
