import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | authenticated/organization-learners | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/organization-learners/list');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // when
      await visit('/organization-learners/list');

      // then
      assert.strictEqual(currentURL(), '/organization-learners/list');
    });

    test('it should not display table if no filter is filled', async function (assert) {
      // given
      server.create('admin-organization-learner', { firstName: 'firstname' });

      // when
      const screen = await visit('/organization-learners/list');

      assert.notOk(screen.queryByRole('table', { name: t('components.organization-learners.list-table.caption') }));
    });

    test('it should display organization learners in table if one filter is filled', async function (assert) {
      // given
      server.create('admin-organization-learner', {
        firstName: 'firstname',
        lastName: 'lastname',
        birthdate: '2000-01-01',
        division: '6e',
        group: 'Groupe A',
        nationalStudentId: '123456789',
        organizationId: 1,
        organizationName: 'Super orga',
        userId: 1,
        updatedAt: new Date(),
        isDisabled: false,
      });
      server.create('admin-organization-learner', {
        firstName: 'firstname1',
        lastName: 'lastname2',
        birthdate: '2000-01-02',
        division: '5e',
        group: 'Groupe B',
        nationalStudentId: '12345678910',
        organizationId: 2,
        organizationName: 'Meilleure orga',
        userId: 2,
        updatedAt: new Date(),
        isDisabled: true,
      });

      // when
      const screen = await visit('/organization-learners/list');

      await fillByLabel('Prénom/Nom', 'first');
      await click(screen.getByRole('button', { name: t('common.filters.actions.load') }));

      // then
      assert.ok(screen.getByText('firstname'));
      assert.ok(screen.getByText('firstname1'));
    });
  });
});
