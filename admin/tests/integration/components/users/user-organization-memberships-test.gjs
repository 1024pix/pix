import { render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import UserOrganizationMemberships from 'pix-admin/components/users/user-organization-memberships';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | users | organization-memberships', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('When user isn’t member of any organization', function () {
    test('it should display an empty table', async function (assert) {
      // given
      class SessionStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:accessControl', SessionStub);

      const organizationMemberships = [];

      // when
      const screen = await render(
        <template><UserOrganizationMemberships @organizationMemberships={{organizationMemberships}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Aucune organisation')).exists();
    });
  });

  module('When user is member of some organizations', function () {
    test('it should display a table with the organizations the user is member of', async function (assert) {
      // given
      class SessionStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:accessControl', SessionStub);

      const organizationMembership1 = EmberObject.create({
        id: 111,
        role: 'MEMBER',
        organizationId: 100025,
        organizationName: 'Dragon & Co',
        organizationType: 'PRO',
      });

      const organizationMembership2 = EmberObject.create({
        id: 222,
        role: 'MEMBER',
        organizationId: 100095,
        organizationName: 'Collège The Night Watch',
        organizationType: 'SCO',
        organizationExternalId: '1237457A',
        lastAccessedAt: new Date('2020-01-01'),
      });

      const organizationMemberships = [organizationMembership1, organizationMembership2];

      // when
      const screen = await render(
        <template><UserOrganizationMemberships @organizationMemberships={{organizationMemberships}} /></template>,
      );

      // then
      const defaultLastAccessDate = t(
        'components.users.user-detail-personal-information.authentication-method.no-last-connection-date-info',
      );
      const rows = await screen.findAllByRole('row');
      assert.dom(within(rows[1]).getByRole('cell', { name: '222' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: '100095' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: 'Collège The Night Watch' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: 'SCO' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: '1237457A' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: '01/01/2020' })).exists();

      assert.dom(within(rows[2]).getByRole('cell', { name: '111' })).exists();
      assert.dom(within(rows[2]).getByRole('cell', { name: '100025' })).exists();
      assert.dom(within(rows[2]).getByRole('cell', { name: 'Dragon & Co' })).exists();
      assert.dom(within(rows[2]).getByRole('cell', { name: 'PRO' })).exists();
      assert.dom(within(rows[2]).getByRole('cell', { name: defaultLastAccessDate })).exists();
    });
  });
});
