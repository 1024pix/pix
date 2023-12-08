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

  module('when user is an admin', function (hooks) {
    let userWithAdminRole;

    hooks.beforeEach(async function () {
      userWithAdminRole = createCertificationPointOfContactWithTermsOfServiceAccepted(
        undefined,
        'PIX Certification Center',
        false,
        'ADMIN',
      );
      server.create('member', { id: 1234, firstName: 'Lee', lastName: 'Tige', isReferer: false });

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
  });
});
