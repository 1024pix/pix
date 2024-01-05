import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | users | organization-memberships', function (hooks) {
  setupRenderingTest(hooks);

  module('When user isn’t member of any organization', function () {
    test('it should display an empty table', async function (assert) {
      // given
      class SessionStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:accessControl', SessionStub);

      const organizationMemberships = [];
      this.set('organizationMemberships', organizationMemberships);

      // when
      const screen = await render(
        hbs`<Users::UserOrganizationMemberships @organizationMemberships={{this.organizationMemberships}} />`,
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
      const dayjsService = this.owner.lookup('service:dayjs');

      const membershipUpdatedAt1 = new Date('2023-12-05T08:00:00Z');
      const membershipUpdatedAt2 = new Date('2023-12-05T09:00:00Z');
      const organizationMembership1 = EmberObject.create({
        id: 111,
        role: 'MEMBER',
        organizationId: 100025,
        organizationName: 'Dragon & Co',
        organizationType: 'PRO',
        updatedAt: membershipUpdatedAt1,
      });

      const organizationMembership2 = EmberObject.create({
        id: 222,
        role: 'MEMBER',
        organizationId: 100095,
        organizationName: 'Collège The Night Watch',
        organizationType: 'SCO',
        organizationExternalId: '1237457A',
        updatedAt: membershipUpdatedAt2,
      });

      const organizationMemberships = [organizationMembership1, organizationMembership2];
      this.set('organizationMemberships', organizationMemberships);

      // when
      const screen = await render(
        hbs`<Users::UserOrganizationMemberships @organizationMemberships={{this.organizationMemberships}} />`,
      );

      // then
      const formattedUpdatedAt1 = dayjsService.self(membershipUpdatedAt1).format('DD/MM/YYYY [-] HH:mm');
      const formattedUpdatedAt2 = dayjsService.self(membershipUpdatedAt2).format('DD/MM/YYYY [-] HH:mm');

      const rows = await screen.findAllByRole('row');
      assert.dom(within(rows[1]).getByRole('cell', { name: '222' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: '100095' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: 'Collège The Night Watch' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: 'SCO' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: '1237457A' })).exists();
      assert.dom(within(rows[1]).getByRole('cell', { name: formattedUpdatedAt2 })).exists();

      assert.dom(within(rows[2]).getByRole('cell', { name: '111' })).exists();

      assert.dom(within(rows[2]).getByRole('cell', { name: '111' })).exists();
      assert.dom(within(rows[2]).getByRole('cell', { name: '100025' })).exists();
      assert.dom(within(rows[2]).getByRole('cell', { name: 'Dragon & Co' })).exists();
      assert.dom(within(rows[2]).getByRole('cell', { name: 'PRO' })).exists();
      assert.dom(within(rows[2]).getByRole('cell', { name: formattedUpdatedAt1 })).exists();
    });
  });
});
