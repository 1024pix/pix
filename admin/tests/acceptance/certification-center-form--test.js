import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { setupApplicationTest } from 'ember-qunit';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Certification-center Form', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const { id: userId } = server.create('user');
    await createAuthenticateSession({ userId });
  });

  test('it should create a certification center', async function(assert) {
    const name = 'name';
    const type = { label: 'Organisation professionnelle', value: 'PRO' };
    const externalId = 'externalId';

    // when
    await visit('/certification-centers/new');

    await fillIn('#certificationCenterName', name);
    await selectChoose('#certificationCenterTypeSelector', type.label);
    await fillIn('#certificationCenterExternalId', externalId);
    await click('button[type=submit]');

    // then
    assert.equal(currentURL(), '/certification-centers/list');
    assert.contains(name);
    assert.contains(type.value);
    assert.contains(externalId);
  });

});
