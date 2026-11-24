import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl, { t } from '../helpers/setup-intl';
import { createPrescriberForOrganization } from '../helpers/test-init';

module('Acceptance | Invitations list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when there is no invitation', function () {
    test('it should display an empty state', async function (assert) {
      // given
      const userAttributes = { lang: 'fr' };
      const organizationAttributes = { id: 777, name: 'Collège Foufoufou' };
      const organizationRole = 'ADMIN';

      const user = createPrescriberForOrganization(userAttributes, organizationAttributes, organizationRole);
      await authenticateSession(user.id);

      // when
      const screen = await visit('/equipe/invitations');

      // then
      assert.ok(screen.getByText(t('pages.team-invitations.empty-table')));
    });
  });

  test('it should be possible to cancel an invitation', async function (assert) {
    // given
    const userAttributes = { lang: 'fr' };
    const invitationAttributes = {
      id: 123,
      email: 'gigi@example.net',
      status: 'pending',
      updatedAt: '2019-10-08',
    };
    const organizationAttributes = { id: 777, name: 'Collège Foufoufou' };
    const organizationRole = 'ADMIN';

    const user = createPrescriberForOrganization(userAttributes, organizationAttributes, organizationRole);
    server.create('organization-invitation', invitationAttributes);
    await authenticateSession(user.id);

    // when
    const screen = await visit('/equipe/invitations');
    await clickByName(t('pages.team-invitations.cancel-invitation'));

    // then
    assert.notOk(screen.queryByText('gigi@example.net'));
    assert.ok(screen.getByText('Invitations (-)'));
  });
});
