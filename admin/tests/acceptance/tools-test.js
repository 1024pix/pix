import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | tools', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('Access', function () {
    module('when user role is superadmin', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      });

      test('Tools campaigns tab should be accessible from /tools', async function (assert) {
        // given & when
        const screen = await visit('/tools');

        // then
        assert.strictEqual(currentURL(), '/tools/campaigns');

        const toolsNav = screen.getByRole('navigation', { name: t('pages.tools.navigation.aria-label') });
        assert.strictEqual(toolsNav.children.length, 3);
        assert
          .dom(within(toolsNav).getByRole('link', { name: t('pages.administration.navigation.campaigns.label') }))
          .exists();
        assert
          .dom(within(toolsNav).getByRole('link', { name: t('pages.administration.navigation.junior.label') }))
          .exists();
        assert
          .dom(within(toolsNav).getByRole('link', { name: t('pages.administration.navigation.certification.label') }))
          .exists();
      });

      test('it should set tools menubar item active', async function (assert) {
        // when
        const screen = await visit(`/tools`);

        // then
        assert.dom(screen.getByRole('link', { name: 'Outils' })).hasClass('active');
      });
    });

    module('when user role is metier', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isMetier: true })(server);
      });

      test('Tools campaigns tab should be accessible from /tools', async function (assert) {
        // given & when
        const screen = await visit('/tools');

        // then
        assert.strictEqual(currentURL(), '/tools/campaigns');

        const toolsNav = screen.getByRole('navigation', { name: t('pages.tools.navigation.aria-label') });
        assert.strictEqual(toolsNav.children.length, 2);
        assert
          .dom(within(toolsNav).getByRole('link', { name: t('pages.administration.navigation.campaigns.label') }))
          .exists();
        assert
          .dom(within(toolsNav).getByRole('link', { name: t('pages.administration.navigation.junior.label') }))
          .exists();
      });

      test('it should set tools menubar item active', async function (assert) {
        // when
        const screen = await visit(`/tools`);

        // then
        assert.dom(screen.getByRole('link', { name: 'Outils' })).hasClass('active');
      });
    });

    module('when user role is certif', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
      });

      test('Tools campaigns tab should be accessible from /tools', async function (assert) {
        // given & when
        const screen = await visit('/tools');

        // then
        assert.strictEqual(currentURL(), '/tools/certification');

        const toolsNav = screen.getByRole('navigation', { name: t('pages.tools.navigation.aria-label') });
        assert.strictEqual(toolsNav.children.length, 1);
        assert
          .dom(within(toolsNav).getByRole('link', { name: t('pages.administration.navigation.certification.label') }))
          .exists();
      });

      test('it should set tools menubar item active', async function (assert) {
        // when
        const screen = await visit(`/tools`);

        // then
        assert.dom(screen.getByRole('link', { name: 'Outils' })).hasClass('active');
      });
    });
  });

  module('certification tab', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isCertif: true })(server);
    });

    module('scoring simulator', function () {
      module('when a capacity is given', function () {
        test('displays a score and competence levels list', async function (assert) {
          // given
          const screen = await visit('/tools');
          await click(screen.getByRole('link', { name: 'Certification' }));

          // when
          await fillIn(screen.getByLabelText('Capacité'), 1);
          await clickByName('Générer un profil');

          // then

          assert.ok(await screen.findByText('Score :'));
          assert.ok(await screen.findByText('768'));
          assert.ok(await screen.findByText('Capacité :'));
          assert.ok(await screen.findByText('1'));

          const table = screen.getByRole('table', { name: 'Niveau par compétence' });
          const rows = await within(table).findAllByRole('row');

          assert.dom(within(table).getByRole('columnheader', { name: 'Compétence' })).exists();
          assert.dom(within(table).getByRole('columnheader', { name: 'Niveau' })).exists();
          assert.dom(within(rows[1]).getByRole('cell', { name: '1.1' })).exists();
          assert.dom(within(rows[1]).getByRole('cell', { name: '3' })).exists();
        });
      });

      module('when a score is given', function () {
        test('displays a competence and competence levels list', async function (assert) {
          // given
          const screen = await visit('/tools');
          await click(screen.getByRole('link', { name: 'Certification' }));

          // when
          await fillIn(screen.getByLabelText('Score global en Pix'), 768);
          await clickByName('Générer un profil');

          // then
          assert.ok(await screen.findByText('Score :'));
          assert.ok(await screen.findByText('768'));
          assert.ok(await screen.findByText('Capacité :'));
          assert.ok(await screen.findByText('1'));

          const table = screen.getByRole('table', { name: 'Niveau par compétence' });
          const rows = await within(table).findAllByRole('row');

          assert.dom(within(table).getByRole('columnheader', { name: 'Compétence' })).exists();
          assert.dom(within(table).getByRole('columnheader', { name: 'Niveau' })).exists();
          assert.dom(within(rows[1]).getByRole('cell', { name: '1.1' })).exists();
          assert.dom(within(rows[1]).getByRole('cell', { name: '3' })).exists();
        });
      });
    });
  });
});
