import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | Certification Centers | Form', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should create a certification center', async function (assert) {
    // given
    const { id: userId } = server.create('user');
    server.create('admin-member', {
      userId,
      isSuperAdmin: true,
    });
    await createAuthenticateSession({ userId });

    server.create('complementary-certification', { key: 'S', label: 'Pix+Surf' });
    server.create('complementary-certification', { key: 'A', label: 'Pix+Autre' });

    const name = 'name';
    const type = { label: 'Organisation professionnelle', value: 'PRO' };
    const externalId = 'externalId';
    this.server.post('/admin/certification-centers', (schema, request) => {
      const { name, type, externalId } = JSON.parse(request.requestBody).data.attributes;
      return schema.certificationCenters.create({ id: 99, name, type, externalId });
    });

    // when
    const screen = await visit('/certification-centers/new');

    await fillIn(screen.getByRole('textbox', { name: 'Nom du centre' }), name);

    await click(screen.getByRole('button', { name: "Type d'établissement" }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: type.label }));

    await fillIn(screen.getByRole('textbox', { name: 'Identifiant externe' }), externalId);

    await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));
    await click(screen.getByRole('button', { name: 'Ajouter' }));

    // then
    assert.strictEqual(currentURL(), '/certification-centers/99');
    assert.dom(screen.getByRole('heading', { name, level: 2 })).exists();
    assert.dom(screen.getByText(type.label)).exists();
    assert.dom(screen.getByText(externalId)).exists();

    //assert.dom(screen.getByRole('listitem', { name: 'Non-habilité pour Pix+Autre' })).exists();
    //assert.dom(screen.getByRole('listitem', { name: 'Habilité pour Pix+Surf' })).exists();
  });
});
