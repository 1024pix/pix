import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | Combined course blueprint | New', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    server.create('country', { code: '99100', name: 'France' });
    server.create('attestation', {
      templateName: 'parentalite',
      key: 'PARENTHOOD',
      file: 'parentalite.pdf',
      label: 'Parentalite',
    });

    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('it should redirect to list after creating successfully', async function (assert) {
    // when
    const screen = await visit('/combined-course-blueprints/new');

    await fillIn(screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }), 1);
    await screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }).click();
    await screen.getByLabelText(t('components.combined-course-blueprints.labels.module')).click();
    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.itemId'), { exact: false }),
      'module-123',
    );
    await screen.getByRole('button', { name: t('components.combined-course-blueprints.create.addItemButton') }).click();
    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.name'), { exact: false }),
      'name',
    );
    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.internal-name'), { exact: false }),
      'internalName',
    );

    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.illustration')),
      'illustrations/hello.svg',
    );

    await fillIn(screen.getByLabelText(t('components.combined-course-blueprints.labels.description')), 'description');

    await click(
      screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
    );

    await screen.findByRole('listbox');

    await click(screen.getByRole('option', { name: 'Parentalite' }));

    await click(screen.getByRole('button', { name: t('components.combined-course-blueprints.create.createButton') }));

    // then
    assert.strictEqual(currentURL(), '/combined-course-blueprints/list');
    assert.strictEqual(screen.getAllByRole('row').length, 2);
    assert.ok(screen.getByRole('cell', { name: /internalName/ }));
  });

  test('it should unload record when the user does not submit the data', async function (assert) {
    //given
    const screen = await visit('/combined-course-blueprints/new');

    //when
    await fillIn(
      screen.getByLabelText(t('components.combined-course-blueprints.labels.internal-name'), { exact: false }),
      'internalName',
    );
    await click(screen.getByRole('link', { name: t('components.layout.sidebar.combined-course-blueprints') }));
    //then
    assert.ok(screen.getByText(t('common.tables.empty-result')));
  });
});
