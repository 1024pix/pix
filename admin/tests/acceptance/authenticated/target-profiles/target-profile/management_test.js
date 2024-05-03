import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

import setupIntl from '../../../../helpers/setup-intl';

module('Acceptance | Target Profile Management', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
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
          server.create('target-profile', { id: 1, name: 'Mon super profil cible' });
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
        name: 'Profil Cible Fantastix',
        isPublic: true,
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
      assert.dom(screen.getByRole('heading', { name: 'Profil Cible Fantastix', level: 2 })).exists();
      assert.dom(screen.getByText('Thématiques')).exists();
      assert.dom(_findByListItemText(screen, 'ID : 1')).exists();
      assert.dom(_findByListItemText(screen, 'Public : Oui')).exists();
      assert.dom(_findByListItemText(screen, 'Obsolète : Non')).exists();
      assert.dom(_findByListItemText(screen, 'Parcours Accès Simplifié : Oui')).exists();
      assert
        .dom(_findByListItemText(screen, `${this.intl.t('pages.target-profiles.resettable-checkbox.label')} : Non`))
        .exists();
      assert.dom(_findByListItemText(screen, 'Est associé à une campagne : Oui')).exists();
      assert.dom(screen.getByText('456')).exists();
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
      assert.dom(_findByListItemText(screen, 'Parcours Accès Simplifié : Oui')).exists();
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
      assert.dom(_findByListItemText(screen, 'Obsolète : Oui')).exists();
    });
  });
});

// workaround https://github.com/testing-library/dom-testing-library/issues/201#issuecomment-484890360
function _findByListItemText(screen, text) {
  return (
    screen.getAllByRole('listitem').find((listitem) => {
      const cleanListItemText = listitem.textContent.replace(/(\r\n|\n|\r)/gm, '').trim();
      return cleanListItemText === text;
    }) || null
  );
}
