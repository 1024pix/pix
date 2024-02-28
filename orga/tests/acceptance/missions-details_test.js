import { module, test } from 'qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Missions Detail', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('All data should be loaded', async function (assert) {
    // given
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    const prescriber = createPrescriberByUser(user);
    prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
    await authenticateSession(user.id);

    server.create('mission', {
      id: 1,
      name: 'Super Mission',
      competenceName: 'Super competence',
      learningObjectives: 'Super Objectif',
    });

    const screen = await visit('/missions/1');

    assert.strictEqual(screen.getAllByText('Super Mission').length, 2);
    assert.dom(screen.getByText('Super competence')).exists();
    assert.dom(screen.getByText('Super Objectif')).exists();
  });
});
