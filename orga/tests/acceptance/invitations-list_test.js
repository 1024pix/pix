import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName } from '@1024pix/ember-testing-library';
import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberForOrganization } from '../helpers/test-init';
import setupIntl from '../helpers/setup-intl';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Invitations list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('it should be possible to cancel an invitation', async function (assert) {
    // given
    const userAttributes = {};
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
    await visit('/equipe/invitations');
    await clickByName(this.intl.t('pages.team-invitations.cancel-invitation'));

    // then
    assert.notContains('gigi@example.net');
    assert.contains('Invitations (-)');
    assert.ok(true);
  });
});
