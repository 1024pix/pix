import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { createCertificationFramework } from 'pix-admin/tests/mirage/helpers/certification/configuration';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Frameworks | certification-framework', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should display list of versions in a certification framework', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    createCertificationFramework(
      {
        id: 'DROIT',
        versionsData: [
          {
            id: 456,
            startDate: new Date('2023-10-12'),
            expirationDate: null,
            status: 'active',
          },
          {
            id: 124,
            startDate: new Date('2023-10-11'),
            expirationDate: new Date('2023-10-12'),
            status: 'archived',
          },
          {
            id: 123,
            startDate: new Date('2023-10-10'),
            expirationDate: new Date('2023-10-11'),
            status: 'archived',
          },
          {
            id: 789,
            startDate: null,
            expirationDate: null,
            status: 'draft',
          },
        ],
      },
      server,
    );

    // when
    const screen = await visit('/certification-frameworks/DROIT');

    // then
    const [, row1, row2, row3, row4] = await screen.findAllByRole('row');
    assert.strictEqual(currentURL(), '/certification-frameworks/DROIT');
    assert.dom(within(row1).getByRole('cell', { name: '789' })).exists();
    assert.dom(within(row1).getByRole('cell', { name: "En cours d'édition" })).exists();
    assert.dom(within(row2).getByRole('cell', { name: '456' })).exists();
    assert.dom(within(row2).getByRole('cell', { name: 'Actif' })).exists();
    assert.dom(within(row3).getByRole('cell', { name: '124' })).exists();
    assert.dom(within(row3).getByRole('cell', { name: 'Archivé' })).exists();
    assert.dom(within(row4).getByRole('cell', { name: '123' })).exists();
    assert.dom(within(row4).getByRole('cell', { name: 'Archivé' })).exists();
  });

  test('it should render target profile page when the framework is CLEA', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    createCertificationFramework(
      {
        id: 'CLEA',
        targetProfilesData: [
          {
            id: 3,
            name: 'ALEX TARGET',
            badgesData: [{ id: 99, createdAt: new Date('2023-10-10T10:50:00Z') }],
          },
          {
            id: 2,
            name: 'JEREM TARGET',
            badgesData: [{ id: 98, createdAt: new Date('2020-10-10T10:50:00Z') }],
          },
        ],
      },
      server,
    );

    // when
    await visit('/certification-frameworks/CLEA/');

    // then
    assert.strictEqual(currentURL(), '/certification-frameworks/CLEA/target-profile');
  });

  test("it shouln't possible to create 2 certification-version with status DRAFT", async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    createCertificationFramework(
      {
        id: 'DROIT',
        versionsData: [
          {
            id: 13,
            startDate: new Date('2023-10-10'),
            expirationDate: null,
            status: 'active',
          },
          {
            id: 14,
            startDate: null,
            expirationDate: null,
            status: 'draft',
          },
        ],
      },
      server,
    );

    // when
    const screen = await visit('/certification-frameworks/DROIT/');
    const button = await screen.findByRole('link', {
      name: t('components.certification-frameworks.certification-framework.create-button'),
      exact: false,
    });

    // then
    assert.strictEqual(button.getAttribute('aria-disabled'), 'true');
    const rows = await screen.findAllByRole('row');
    assert.strictEqual(rows.length, 3);
    assert.dom(await screen.getByRole('cell', { name: "En cours d'édition" })).exists();
    assert.dom(await screen.getByRole('cell', { name: 'Actif' })).exists();

    await clickByName('Supprimer la version 14');
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

  test('it should redirect to the certification framework edit page on click', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    createCertificationFramework(
      {
        id: 'CORE',
        versionsData: [
          {
            id: 12,
            status: 'draft',
          },
        ],
      },
      server,
    );
    await visit('/certification-frameworks/CORE/');

    // when
    await clickByName('Éditer la version 12');

    // then
    assert.strictEqual(currentURL(), '/certification-frameworks/CORE/versions/12/edit');
  });
});
