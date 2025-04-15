import { render } from '@1024pix/ember-testing-library';
import dayjs from 'dayjs';
import { t } from 'ember-intl/test-support';
import MemberItem from 'pix-admin/components/organizations/member-item';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | MemberItem', function (hooks) {
  setupIntlRenderingTest(hooks);

  let currentUser;
  const now = new Date('2021-01-01T12:00:00Z');

  hooks.beforeEach(function () {
    sinon.stub(Date, 'now').returns(now);
    currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('displays an organization member details', async function (assert) {
    // given
    const member = {
      user: {
        id: 123,
        firstName: 'John',
        lastName: 'Doe',
        email: 'toto@example.net',
      },
      lastAccessedAt: now,
    };

    const screen = await render(<template><MemberItem @organizationMembership={{member}} /></template>);

    // then

    assert.dom(screen.getByRole('cell', { name: '123' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'John' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Doe' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'toto@example.net' })).exists();
    assert.dom(screen.getByRole('cell', { name: dayjs(now).format('DD/MM/YYYY') })).exists();
  });
  module('if there is no last access date', function () {
    test('displays default last access date', async function (assert) {
      // given
      const member = {
        user: {
          id: 123,
          firstName: 'John',
          lastName: 'Doe',
          email: 'toto@example.net',
        },
      };

      const screen = await render(<template><MemberItem @organizationMembership={{member}} /></template>);

      // then

      assert.dom(screen.getByRole('cell', { name: '123' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'John' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Doe' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'toto@example.net' })).exists();
      assert
        .dom(
          screen.getByRole('cell', {
            name: t('components.organizations.member-items.no-last-connection-date-info'),
          }),
        )
        .exists();
    });
  });
});
