import { clickByName, visit } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createPrescriberByUser, createUserMembershipWithRole } from '../helpers/test-init';

module('Acceptance | Remove membership', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;

  hooks.beforeEach(async function () {
    const adminUser = createUserMembershipWithRole('ADMIN');
    createPrescriberByUser({ user: adminUser });

    await authenticateSession(adminUser.id);
    const organizationId = adminUser.memberships.models.firstObject.organizationId;

    user = server.create('user', { firstName: 'John', lastName: 'Doe' });
    server.create('membership', { userId: user.id, organizationId, organizationRole: 'MEMBER' });
  });

  test('should remove the membership', async function (assert) {
    // given
    const screen = await visit('/equipe');

    await clickByName(this.intl.t('pages.team-members.actions.manage'));
    await clickByName(this.intl.t('pages.team-members.actions.remove-membership'));

    await screen.findByRole('dialog');

    // when
    await clickByName(this.intl.t('pages.team-members.remove-membership-modal.actions.remove'));

    // then
    assert.ok(
      screen.findByText(
        this.intl.t('pages.team-members.notifications.remove-membership.success', {
          memberFirstName: user.firstName,
          memberLastName: user.lastName,
        }),
      ),
    );
  });
});
