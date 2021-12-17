import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | tools', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should be possible to create a new tag', async function (assert) {
    // given
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });

    // when
    await visit('/tools');
    await fillInByLabel('Nom du tag', 'Mon super tag');
    await clickByLabel('Créer le tag');

    // then
    assert.contains('Le tag a bien été créé !');
  });
});
