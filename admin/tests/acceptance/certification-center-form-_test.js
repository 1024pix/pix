import { module, test } from 'qunit';
import { currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import fillInByLabel from '../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Certification-center Form', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const { id: userId } = server.create('user');
    await createAuthenticateSession({ userId });
  });

  test('it should create a certification center', async function (assert) {
    // given
    this.server.create('accreditation', { name: 'Pix+ Droit' });
    this.server.create('accreditation', { name: 'Cléa Numérique' });

    const name = 'name';
    const type = { label: 'Organisation professionnelle', value: 'PRO' };
    const externalId = 'externalId';

    // when
    await visit('/certification-centers/new');
    await fillInByLabel('Nom du centre', name);
    await fillIn('#certificationCenterTypeSelector', type.value);
    await fillInByLabel('Identifiant externe', externalId);
    await clickByLabel('Pix+ Droit');
    await clickByLabel('Ajouter');

    // then
    assert.equal(currentURL(), '/certification-centers/list');
    assert.contains(name);
    assert.contains(type.value);
    assert.contains(externalId);
  });
});
