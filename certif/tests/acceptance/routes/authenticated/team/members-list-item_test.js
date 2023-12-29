import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit } from '@1024pix/ember-testing-library';
import { clickByName } from '@1024pix/ember-testing-library';

import setupIntl from '../../../../helpers/setup-intl';
import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
} from '../../../../helpers/test-init';

module('Acceptance | Routes | Team | membersListItem', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let userWithAdminRole;
  let member;

  module('when user is an admin', function (hooks) {
    hooks.beforeEach(async function () {
      userWithAdminRole = createCertificationPointOfContactWithTermsOfServiceAccepted(
        undefined,
        'PIX Certification Center',
        false,
        'ADMIN',
      );
      member = server.create('member', {
        id: 1234,
        certificationCenterMembershipId: 5678,
        firstName: 'Lee',
        lastName: 'Tige',
        isReferer: false,
      });
      await authenticateSession(userWithAdminRole.id);
    });

    test('change member’s role', async function (assert) {
      // given
      const manageButtonName = this.intl.t('pages.team.members.actions.manage');

      // when
      const screen = await visit(`/equipe/membres`);
      await clickByName(manageButtonName);

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: this.intl.t('pages.team.members.actions.edit-role'),
          }),
        )
        .exists();
    });

    test('delete member', async function (assert) {
      // given
      const manageButtonName = this.intl.t('pages.team.members.actions.manage');

      // when
      const screen = await visit('/equipe/membres');
      await clickByName(manageButtonName);
      await clickByName(this.intl.t('pages.team.members.actions.remove-membership'));
      await screen.findByRole('dialog');
      await clickByName(this.intl.t('pages.team.members.remove-membership-modal.actions.remove'));

      // then
      assert.ok(
        screen.findByText(
          this.intl.t('pages.team.members.notifications.remove-membership.success', {
            memberFirstName: member.firstName,
            memberLastName: member.lastName,
          }),
        ),
      );
    });
  });
});
