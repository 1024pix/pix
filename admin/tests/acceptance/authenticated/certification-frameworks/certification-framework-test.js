import { visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Frameworks | certification-framework', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should display list of versions in a certification framework', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    server.create('certification-framework', { id: 'DROIT', name: 'DROIT' });
    server.create('framework-history', {
      id: 'DROIT',
      history: [
        {
          id: 456,
          startDate: new Date('2023-10-12'),
          expirationDate: null,
          assessmentDuration: 90,
          maximumAssessmentLength: 32,
          status: 'active',
        },
        {
          id: 123,
          startDate: new Date('2023-10-10'),
          expirationDate: new Date('2023-10-11'),
          assessmentDuration: 90,
          maximumAssessmentLength: 32,
          status: 'archived',
        },
        {
          id: 789,
          startDate: null,
          expirationDate: null,
          assessmentDuration: 90,
          maximumAssessmentLength: 32,
          status: 'draft',
        },
      ],
    });

    // when
    const screen = await visit('/certification-frameworks/DROIT');

    // then
    const [, row1, row2, row3] = await screen.findAllByRole('row');
    assert.strictEqual(currentURL(), '/certification-frameworks/DROIT');
    assert.dom(within(row1).getByRole('cell', { name: '789' })).exists();
    assert.dom(within(row1).getByRole('cell', { name: "En cours d'édition" })).exists();
    assert.dom(within(row2).getByRole('cell', { name: '456' })).exists();
    assert.dom(within(row2).getByRole('cell', { name: 'Actif' })).exists();
    assert.dom(within(row3).getByRole('cell', { name: '123' })).exists();
    assert.dom(within(row3).getByRole('cell', { name: 'Archivé' })).exists();
  });

  test('it should render target profile page when the framework is CLEA', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    server.create('complementary-certification', {
      id: 1,
      hasComplementaryReferential: false,
      key: 'CLEA',
      label: 'Cléa',
      targetProfilesHistory: [
        { name: 'ALEX TARGET', id: 3, attachedAt: new Date('2023-10-10T10:50:00Z') },
        { name: 'JEREM TARGET', id: 2, attachedAt: new Date('2020-10-10T10:50:00Z') },
      ],
    });
    server.create('certification-framework', { id: 'CLEA', name: 'CLEA' });
    server.create('target-profile', {
      id: 2,
      name: 'JEREM TARGET',
    });
    server.create('framework-history', {
      id: 'CLEA',
      history: [],
    });

    // when
    await visit('/certification-frameworks/CLEA/');

    // then
    assert.strictEqual(currentURL(), '/certification-frameworks/CLEA/target-profile');
  });

  test('it should display the create-button', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    server.create('certification-framework', { id: 'DROIT', name: 'DROIT' });
    server.create('framework-history', {
      id: 'DROIT',
      history: [],
    });

    // when
    const screen = await visit('/certification-frameworks/DROIT/');

    // then
    assert
      .dom(
        screen.queryByRole('link', {
          name: t('components.certification-frameworks.certification-framework.create-button'),
        }),
      )
      .exists();
  });

  test("it shouln't possible to create 2 certification-version with status DRAFT", async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

    server.create('certification-framework', { id: 'DROIT', name: 'DROIT' });
    server.create('framework-history', {
      id: 'DROIT',
      history: [
        {
          id: 13,
          startDate: new Date('2023-10-10'),
          expirationDate: null,
          assessmentDuration: 90,
          maximumAssessmentLength: 32,
          status: 'active',
        },
        {
          id: 14,
          startDate: null,
          expirationDate: null,
          assessmentDuration: 90,
          maximumAssessmentLength: 32,
          status: 'draft',
        },
      ],
    });

    server.create('certification-version', { id: 13 });
    server.create('certification-version', { id: 14 });

    // when
    const screen = await visit('/certification-frameworks/DROIT/');
    const button = await screen.findByRole('link', {
      name: t('components.certification-frameworks.certification-framework.create-button'),
      exact: false,
    });

    // then
    assert.strictEqual(button.getAttribute('aria-disabled'), 'true');

    const rows = await screen.findAllByRole('row');
    const [, row1] = rows;

    assert.strictEqual(rows.length, 3);
    assert.dom(await screen.getByRole('cell', { name: "En cours d'édition" })).exists();
    assert.dom(await screen.getByRole('cell', { name: 'Actif' })).exists();

    const deleteButton = within(row1).getByRole('button', {
      name: t('components.certification-frameworks.certification-framework.history.table.actions.delete'),
    });

    await click(deleteButton);

    const confirmButton = await screen.findByRole('button', {
      name: t('components.certification-frameworks.deletion-modal.action-button'),
    });

    await click(confirmButton);

    assert.strictEqual(button.getAttribute('aria-disabled'), 'false');
    const rowsAfterDelete = await screen.findAllByRole('row');
    assert.strictEqual(rowsAfterDelete.length, 2);
    assert.dom(await screen.queryByRole('cell', { name: "En cours d'édition" })).doesNotExist();
    assert.dom(await screen.getByRole('cell', { name: 'Actif' })).exists();
  });
});
