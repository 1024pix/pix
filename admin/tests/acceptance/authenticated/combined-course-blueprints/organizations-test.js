import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import { authenticateAdminMemberWithRole } from '../../../helpers/test-init';

module('Acceptance | combined course blueprint Organizations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('Access restriction stuff', function () {
    module('When admin member is not logged in', function () {
      test('it should not be accessible by an unauthenticated user', async function (assert) {
        // when
        await visit('/combined-course-blueprints/1/organizations');

        // then
        assert.strictEqual(currentURL(), '/login');
      });
    });

    module('When admin member is logged in', function () {
      module('when admin member has role "SUPER_ADMIN", "CERTIF", "SUPPORT" or "METIER"', function (hooks) {
        hooks.beforeEach(async function () {
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
          server.create('organization', {
            id: 456,
            name: 'My organization',
            features: { PLACES_MANAGEMENT: { active: false } },
          });
          server.create('combined-course-blueprint', {
            id: 1,
            name: 'le blueprint ia',
            internalName: 'le blueprint -- nom interne',
          });
        });

        test('it should be accessible for an authenticated user', async function (assert) {
          // when
          await visit('/combined-course-blueprints/1/organizations');

          // then
          assert.strictEqual(currentURL(), '/combined-course-blueprints/1/organizations');
        });

        test('it should set combined-course-blueprint menubar item active', async function (assert) {
          // when
          const screen = await visit(`/combined-course-blueprints/1/organizations`);

          // then
          assert
            .dom(screen.getByRole('link', { name: t('components.layout.sidebar.combined-course-blueprints') }))
            .hasClass('active');
        });
      });
    });
  });

  module('Combined course blueprint organizations', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      server.create('combined-course-blueprint', {
        id: 1,
        name: 'le blueprint ia',
        internalName: 'le blueprint -- nom interne',
      });
    });

    module('with multiple organizations', function (hooks) {
      hooks.beforeEach(async function () {
        server.create('organization', {
          id: 456,
          name: 'My organization',
          features: { PLACES_MANAGEMENT: { active: false } },
        });
        server.create('organization', {
          id: 789,
          name: 'My other organization',
          features: { PLACES_MANAGEMENT: { active: false } },
        });
      });

      test('should list organizations', async function (assert) {
        const screen = await visit('/combined-course-blueprints/1');
        assert.dom(screen.getByText('My organization')).exists();
        assert.dom(screen.getByText('My other organization')).exists();
      });

      test('it should redirect to organization details on click', async function (assert) {
        // given
        const screen = await visit('/combined-course-blueprints/1');
        // when
        await click(screen.getByRole('link', { name: '456' }));

        // then
        assert.deepEqual(currentURL(), '/organizations/456/details');
      });

      test('it should redirect to combined course blueprint details after detach', async function (assert) {
        // given
        const screen = await visit('/combined-course-blueprints/1');

        const detachButton = screen.getAllByRole('button', { name: 'Détacher' })[0];

        // when
        await click(detachButton);

        const confirmButton = await screen.findByRole('button', { name: 'Confirmer' });
        await click(confirmButton);

        assert.deepEqual(currentURL(), '/combined-course-blueprints/1/organizations');
      });
    });
  });
});
