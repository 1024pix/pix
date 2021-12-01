import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';
import authenticateSession from '../helpers/authenticate-session';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | preselect-target-profile', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);
    await authenticateSession(user.id);
  });

  test('it should display tubes', async function (assert) {
    // when
    await visit('/selection-sujets');

    // then
    assert.dom('.tube-select').exists({ count: 3 });
  });
});
