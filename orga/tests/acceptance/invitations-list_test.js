import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { clickByLabel } from '../helpers/testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberForOrganization } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Invitations list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
    await clickByLabel('Supprimer l’invitation');

    // then
    assert.notContains('gigi@example.net');
    assert.contains('Invitations (-)');
    assert.ok(true);
  });
});
