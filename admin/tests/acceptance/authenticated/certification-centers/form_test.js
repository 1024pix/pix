import { module, test } from 'qunit';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { visit as visitScreen } from '@1024pix/ember-testing-library';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Certification Centers | Form', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const { id: userId } = server.create('user');
    await createAuthenticateSession({ userId });
  });

  test('it should create a certification center', async function (assert) {
    // given
    this.server.create('habilitation', { name: 'Pix+ Droit' });
    this.server.create('habilitation', { name: 'CléA Numérique' });

    const name = 'name';
    const type = { label: 'Organisation professionnelle', value: 'PRO' };
    const externalId = 'externalId';
    this.server.post('/certification-centers', (schema, request) => {
      const { name, type, externalId, isSupervisorAccessEnabled } = JSON.parse(request.requestBody).data.attributes;
      return schema.certificationCenters.create({ id: 99, name, type, externalId, isSupervisorAccessEnabled });
    });

    // when
    const screen = await visitScreen('/certification-centers/new');

    await fillIn(screen.getByRole('textbox', { name: 'Nom du centre' }), name);
    await fillIn(screen.getByRole('combobox', { name: "Type d'établissement" }), type.value);
    await fillIn(screen.getByRole('textbox', { name: 'Identifiant externe' }), externalId);

    await click(screen.getByRole('checkbox', { name: 'Pix+ Droit' }));
    await click(screen.getByRole('button', { name: 'Ajouter' }));

    // then
    assert.strictEqual(currentURL(), '/certification-centers/99');
    assert.dom(screen.getByRole('heading', { name })).exists();
    assert.dom(screen.getByText(type.label)).exists();
    assert.dom(screen.getByText(externalId)).exists();
    assert.strictEqual(screen.getByLabelText('Espace surveillant').textContent, 'oui');

    assert.dom(screen.getByRole('listitem', { name: 'Non-habilité pour CléA Numérique' })).exists();
    assert.dom(screen.getByRole('listitem', { name: 'Habilité pour Pix+ Droit' })).exists();
  });
});
