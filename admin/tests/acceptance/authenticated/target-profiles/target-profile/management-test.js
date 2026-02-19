import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Target Profile Management', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks, 'fr');
  setupMirage(hooks);

  module('Access restriction stuff', function () {
    module('When admin member is not logged in', function () {
      test('it should not be accessible by an unauthenticated user', async function (assert) {
        // when
        await visit('/target-profiles/1');

        // then
        assert.strictEqual(currentURL(), '/login');
      });
    });

    module('When admin member is logged in', function () {
      module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
        hooks.beforeEach(async function () {
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          server.create('target-profile', { id: 1, internalName: 'Mon super profil cible' });
        });

        test('it should be accessible for an authenticated user', async function (assert) {
          // when
          await visit('/target-profiles/1');

          // then
          assert.strictEqual(currentURL(), '/target-profiles/1/details');
        });

        test('it should set target-profiles menubar item active', async function (assert) {
          // when
          const screen = await visit(`/target-profiles/1/details`);

          // then
          assert.dom(screen.getByRole('link', { name: 'Profils cibles' })).hasClass('active');
        });
      });

      module('when admin member has role "CERTIF"', function () {
        test('it should be redirect to Organizations page', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isCertif: true })(server);
          server.create('target-profile', { id: 2 });

          // when
          await visit('/target-profiles/2');

          // then
          assert.strictEqual(currentURL(), '/organizations/list');
        });
      });
    });
  });

  module('target profile management', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('it should display details of the target profile', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        name: 'Profil Cible Fantastix externe',
        internalName: 'Profil Cible Fantastix',
        outdated: false,
        ownerOrganizationId: 456,
        description: 'Top profil cible.',
        comment: 'Commentaire Privé.',
        category: 'SUBJECT',
        isSimplifiedAccess: true,
        hasLinkedCampaign: true,
        areKnowledgeElementsResettable: false,
      });

      // when
      const screen = await visit('/target-profiles/1');

      // then
      const termsList = screen.getAllByRole('term');
      const definitionsList = screen.getAllByRole('definition');

      assert.dom(screen.getByRole('heading', { name: 'Profil Cible Fantastix', level: 1 })).exists();
      assert.dom(screen.getByText('Thématiques')).exists();

      assert.strictEqual(termsList[0].textContent.trim(), t('pages.target-profiles.label.id'));
      assert.strictEqual(definitionsList[0].textContent.trim(), '1');

      assert.strictEqual(termsList[5].textContent.trim(), t('pages.target-profiles.label.outdated'));
      assert.strictEqual(definitionsList[5].textContent.trim(), t('common.words.no'));

      assert.strictEqual(termsList[7].textContent.trim(), t('pages.target-profiles.label.link-campaign'));
      assert.strictEqual(definitionsList[7].textContent.trim(), t('common.words.yes'));

      assert.strictEqual(termsList[8].textContent.trim(), t('pages.target-profiles.resettable-checkbox.label'));
      assert.strictEqual(definitionsList[8].textContent.trim(), t('common.words.no'));

      assert.dom(screen.getByText('Top profil cible.')).exists();
      assert.dom(screen.getByText('Commentaire Privé.')).exists();
      assert.dom(screen.getByAltText('Profil cible')).exists();
    });

    test('it should mark target profile as simplified access', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        isSimplifiedAccess: false,
      });

      // when
      const screen = await visit('/target-profiles/1');
      await clickByName('Marquer comme accès simplifié');
      await screen.findByRole('dialog');
      await clickByName('Oui, marquer comme accès simplifié');

      // then
      const termsList = screen.getAllByRole('term');
      const definitionsList = screen.getAllByRole('definition');

      assert.strictEqual(termsList[6].textContent.trim(), t('pages.target-profiles.label.simplified-access'));
      assert.strictEqual(definitionsList[6].textContent.trim(), t('common.words.yes'));
    });

    test('it should outdate target profile', async function (assert) {
      // given
      server.create('target-profile', {
        id: 1,
        outdated: false,
      });

      // when
      const screen = await visit('/target-profiles/1');
      await clickByName('Marquer comme obsolète');
      await screen.findByRole('dialog');
      await clickByName('Oui, marquer comme obsolète');

      // then
      assert
        .dom(
          await screen.findByText((_, e) => {
            return e.textContent.trim() === t('pages.target-profiles.label.outdated');
          }),
        )
        .exists();
      assert
        .dom(
          await screen.findByText((_, e) => {
            return e.textContent.trim() === t('common.words.yes');
          }),
        )
        .exists();
      assert.dom(screen.queryByRole('button', { name: 'Marquer comme obsolète' })).doesNotExist();
    });
  });
});
