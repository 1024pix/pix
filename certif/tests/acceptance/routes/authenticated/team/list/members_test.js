import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import setupIntl from '../../../../../helpers/setup-intl';
import {
  authenticateSession,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
} from '../../../../../helpers/test-init';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';

module('Acceptance | Routes | Team | List | Members', function (hooks) {
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
      member = this.server.create('member', {
        id: 1234,
        certificationCenterMembershipId: 5678,
        firstName: 'Lee',
        lastName: 'Tige',
        isReferer: false,
        role: 'MEMBER',
      });

      await authenticateSession(userWithAdminRole.id);
    });

    test('changes member’s role', async function (assert) {
      // given
      const screen = await visit(`/equipe/membres`);

      // when
      await clickByName(this.intl.t('pages.team.members.actions.manage'));
      await clickByName(this.intl.t('pages.team.members.actions.edit-role'));
      await clickByName(this.intl.t('pages.team.members.actions.select-role.label'));
      await screen.findByRole('listbox');
      await click(
        screen.getByRole('option', { name: this.intl.t('pages.team.members.actions.select-role.options.admin') }),
      );
      await clickByName(this.intl.t('pages.team.members.actions.save'));
      const rows = await screen.findAllByRole('row');

      // then
      assert.dom(rows[2]).containsText('Administrateur');
      assert.dom(screen.getByText('Le rôle a bien été changé.'));
    });

    test('deletes a member', async function (assert) {
      // given
      const screen = await visit('/equipe/membres');
      await clickByName(this.intl.t('pages.team.members.actions.manage'));
      await clickByName(this.intl.t('pages.team.members.actions.remove-membership'));
      await screen.findByRole('dialog');

      // when
      await clickByName(this.intl.t('pages.team.members.remove-membership-modal.actions.remove'));

      // then
      assert
        .dom(
          screen.getByText(
            `${member.firstName} ${member.lastName} a été supprimé avec succès de votre équipe Pix Certif.`,
          ),
        )
        .exists();
    });
  });
});
