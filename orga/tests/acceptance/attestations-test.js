import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl, { t } from '../helpers/setup-intl';
import { createPrescriberByUser, createUserManagingStudents } from '../helpers/test-init';

module('Acceptance | Attestations', function (hooks) {
  let prescriber;

  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(() => {});

  test('it should not be accessible by an unauthenticated user', async function (assert) {
    // when
    await visit('/attestations');

    // then
    assert.strictEqual(currentURL(), '/connexion');
  });

  module('when the prescriber is authenticated', (hooks) => {
    hooks.beforeEach(async () => {
      const user = createUserManagingStudents('ADMIN', 'SCO');
      server.create('division', {
        name: '6eme',
      });
      server.create('division', {
        name: '5eme',
      });
      server.create('member-identity', { id: user.id, firstName: user.firstName, lastName: user.lastName });
      server.create('attestation', {
        label: '6eme',
        key: 'SIXTH_GRADE',
      });
      server.create('attestation-participant-status', {
        firstName: 'Jean',
        lastName: 'LastName1',
        obtainedAt: null,
        division: '6eme',
        attestationKey: 'SIXTH_GRADE',
      });
      server.create('attestation-participant-status', {
        firstName: 'Eude',
        lastName: 'LastName2',
        obtainedAt: '2024-01-01',
        division: '5eme',
        attestationKey: 'SIXTH_GRADE',
      });
      prescriber = createPrescriberByUser({ user });
      prescriber.features = {
        ...prescriber.features,
        ATTESTATIONS_MANAGEMENT: { active: true, params: ['SIXTH_GRADE'] },
      };
      await authenticateSession(user.id);
    });

    test('it should be accessible for an authenticated prescriber', async function (assert) {
      // when
      await visit('/attestations');

      // then
      assert.strictEqual(currentURL(), '/attestations');
    });

    test('it should list learners with their status', async function (assert) {
      // when
      const screen = await visit('/attestations');

      // then
      assert.ok(screen.getByRole('button', { name: t('pages.attestations.table.filter.divisions.label') }));
      assert.ok(screen.getByRole('button', { name: t('pages.attestations.table.filter.status.label') }));
      assert.ok(screen.getByRole('textbox', { name: t('common.filters.fullname.label') }));
      assert.ok(screen.getByRole('columnheader', { name: t('pages.attestations.table.column.first-name') }));
      assert.ok(screen.getByRole('columnheader', { name: t('pages.attestations.table.column.last-name') }));
      assert.ok(screen.getByRole('columnheader', { name: t('pages.attestations.table.column.status') }));
      assert.ok(screen.getByRole('columnheader', { name: t('pages.attestations.table.column.division') }));
      assert.ok(screen.getByRole('cell', { name: 'Jean' }));
      assert.ok(screen.getByRole('cell', { name: 'LastName1' }));
      assert.ok(screen.getByRole('cell', { name: 'Eude' }));
      assert.ok(screen.getByRole('cell', { name: 'LastName2' }));
      assert.ok(
        screen.getByRole('cell', { name: t('pages.attestations.table.status.obtained', { date: '01/01/2024' }) }),
      );
      assert.ok(screen.getByRole('cell', { name: t('pages.attestations.table.status.not-obtained') }));
      assert.ok(screen.getByRole('cell', { name: '6eme' }));
      assert.ok(screen.getByRole('cell', { name: '5eme' }));
    });

    module('when using attestation filters', function () {
      test('should be possible to filter by status', async function (assert) {
        // given
        const screen = await visit('/attestations');

        // when
        await click(screen.getByLabelText(t('pages.attestations.table.filter.status.label')));
        await click(
          await screen.findByRole('checkbox', {
            name: t('pages.attestations.table.filter.status.not-obtained'),
          }),
        );

        // then
        assert.ok(screen.getByRole('cell', { name: t('pages.attestations.table.status.not-obtained') }));
        assert.notOk(
          screen.queryByRole('cell', { name: t('pages.attestations.table.status.obtained', { date: '01/01/2024' }) }),
        );
      });

      test('should be possible to filter by divisions', async function (assert) {
        // given
        const screen = await visit('/attestations');

        // when
        await click(screen.getByLabelText(t('pages.attestations.table.filter.divisions.label')));
        await click(
          await screen.findByRole('checkbox', {
            name: '6eme',
          }),
        );

        // then
        assert.ok(screen.getByRole('cell', { name: '6eme' }));
        assert.notOk(screen.queryByRole('cell', { name: '5eme' }));
      });

      test('should be possible to filter by name', async function (assert) {
        // given
        const screen = await visit('/attestations');

        // when
        await fillByLabel(t('common.filters.fullname.label'), 'Je');

        // then
        assert.ok(screen.getByRole('cell', { name: 'Jean' }));
        assert.notOk(screen.queryByRole('cell', { name: 'Eude' }));
      });

      test('should be possible to filter by attestation name', async function (assert) {
        // given
        prescriber.features.ATTESTATIONS_MANAGEMENT = {
          active: true,
          params: ['SIXTH_GRADE', 'ATTESTATION_KEY_1'],
        };
        server.create('attestation', {
          label: 'Label attestation',
          key: 'ATTESTATION_KEY_1',
        });
        server.create('attestation-participant-status', {
          firstName: 'Claude',
          lastName: 'LastName2',
          obtainedAt: '2024-01-01',
          division: '5eme',
          attestationKey: 'ATTESTATION_KEY_1',
        });
        const screen = await visit('/attestations');

        // when
        await click(screen.getByLabelText(t('pages.attestations.select-label')));

        await screen.findByRole('listbox');

        await click(screen.getByRole('option', { name: 'Label attestation' }));

        // then
        assert.notOk(screen.queryByRole('cell', { name: 'Jean' }));
        assert.ok(screen.getByRole('cell', { name: 'Claude' }));
      });

      module('when prescriber click on reset filters', function () {
        test('should reset filters', async function (assert) {
          // given
          const screen = await visit('/attestations');
          await fillByLabel(t('common.filters.fullname.label'), 'Je');
          await click(screen.getByLabelText(t('pages.attestations.table.filter.status.label')));
          await click(
            await screen.findByRole('checkbox', {
              name: t('pages.attestations.table.filter.status.not-obtained'),
            }),
          );
          await click(screen.getByLabelText(t('pages.attestations.table.filter.divisions.label')));
          await click(
            await screen.findByRole('checkbox', {
              name: '6eme',
            }),
          );

          // when
          await clickByName('Effacer les filtres');

          // then
          assert.strictEqual(screen.getByLabelText(t('common.filters.fullname.label')).value, '');
          assert.strictEqual(screen.getByLabelText(t('pages.attestations.table.filter.status.label')).value, '');
          assert.strictEqual(screen.getByLabelText(t('pages.attestations.table.filter.divisions.label')).value, '');
        });
      });
    });

    module('when using attestation pagination', function () {
      test('should be possible to change page', async function (assert) {
        // given
        const screen = await visit('/attestations?pageSize=1');

        assert.ok(screen.getByRole('cell', { name: 'Jean' }));
        assert.notOk(screen.queryByText('Eude'));

        // when
        await clickByName('Aller à la page suivante');

        // then
        assert.strictEqual(currentURL(), '/attestations?pageNumber=2&pageSize=1');
        assert.ok(screen.getByRole('cell', { name: 'Eude' }));
        assert.notOk(screen.queryByText('Jean'));
      });
    });
  });
});
