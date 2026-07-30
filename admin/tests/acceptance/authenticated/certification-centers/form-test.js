import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
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
      const { data } = JSON.parse(request.requestBody);
      const { name, type, externalId } = data.attributes;
      const habilitationIds = (data.relationships?.habilitations?.data ?? []).map(({ id }) => id);
      return schema.certificationCenters.create({ id: 99, name, type, externalId, habilitationIds });
    });

    // when
    const screen = await visit('/certification-centers/new');

    await fillIn(
      screen.getByRole('textbox', { name: `${t('components.certification-centers.creation.name.label')} *` }),
      name,
    );

    await click(screen.getByRole('button', { name: `${t('components.certification-centers.creation.type.label')} *` }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: type.label }));

    await fillIn(
      screen.getByRole('textbox', { name: t('components.certification-centers.creation.external-id.label') }),
      externalId,
    );
    await click(screen.getByRole('checkbox', { name: 'Pix+Surf' }));
    await click(screen.getByRole('button', { name: t('common.actions.add') }));

    // then
    assert.strictEqual(currentURL(), '/certification-centers/99/details');
    assert.dom(screen.getByRole('heading', { name, level: 1 })).exists();
    assert.dom(screen.getByText(type.label)).exists();
    assert.dom(screen.getByText(externalId)).exists();

    assert.dom(screen.getByRole('listitem', { name: 'Habilité pour Pix+Surf' })).exists();
    assert.dom(screen.getByRole('listitem', { name: 'Non habilité pour Pix+Autre' })).exists();
  });
});
