import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ListTable from 'pix-admin/components/organization-learners/list-table';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationLearners | ListTable', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('it should display organization learners list', async function (assert) {
    // given
    const organizationLearners = [
      store.createRecord('admin-organization-learner', {
        firstName: 'firstname1',
        lastName: 'lastname1',
        birthdate: '2000-01-01',
        division: '6e',
        nationalStudentId: '123456789',
        organizationId: 1,
        organizationName: 'Super orga',
        userId: 1,
        updatedAt: new Date('2025-01-01'),
        isDisabled: false,
      }),
      store.createRecord('admin-organization-learner', {
        firstName: 'firstname2',
      }),
      store.createRecord('admin-organization-learner', {
        firstName: 'firstname3',
      }),
    ];

    // when
    const screen = await render(<template><ListTable @organizationLearners={{organizationLearners}} /></template>);

    // then
    const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });
    const rows = within(table).getAllByRole('row');

    assert.dom(within(table).getByRole('cell', { name: 'firstname1' })).exists();
    assert.dom(within(table).getByRole('cell', { name: 'lastname1' })).exists();
    assert.dom(within(table).getByRole('cell', { name: '01/01/2000' })).exists();
    assert.dom(within(table).getByRole('cell', { name: '6e' })).exists();
    assert.dom(within(table).getByRole('cell', { name: '123456789' })).exists();
    assert.dom(within(table).getByRole('cell', { name: '01/01/2025' })).exists();

    assert.dom(within(table).getByRole('cell', { name: 'firstname2' })).exists();
    assert.dom(within(table).getByRole('cell', { name: 'firstname3' })).exists();
    assert.strictEqual(rows.length, 4);
  });

  module('divison / group', function () {
    test('it should display division but not group if division is set', async function (assert) {
      //given
      const organizationLearner = [
        store.createRecord('admin-organization-learner', {
          division: '6e',
          group: 'Groupe A',
        }),
      ];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearner}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });

      assert.dom(within(table).getByRole('cell', { name: '6e' })).exists();
    });
    test('it should display group if division is not set', async function (assert) {
      //given
      const organizationLearner = [
        store.createRecord('admin-organization-learner', {
          group: 'Groupe A',
        }),
      ];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearner}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });

      assert.dom(within(table).getByRole('cell', { name: 'Groupe A' })).exists();
    });
  });

  module('organization link', function () {
    test('it should display organization link', async function (assert) {
      //given
      const organizationLearner = [
        store.createRecord('admin-organization-learner', {
          organizationId: 1,
          organizationName: 'Orga',
        }),
      ];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearner}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });

      assert.ok(screen.getByText('Orga'));
      const link = within(table).getByRole('link', { name: `Voir l'organisation` });
      assert.ok(link.getAttribute('href').endsWith('/organizations/1'));
    });
    test('it should not display organization link', async function (assert) {
      //given
      const organizationLearner = [
        store.createRecord('admin-organization-learner', {
          organizationId: undefined,
          organizationName: undefined,
        }),
      ];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearner}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });

      assert.dom(within(table).queryByRole('link', { name: `Voir l'organisation` })).doesNotExist();
    });
  });

  module('user link', function () {
    test('it should display user link', async function (assert) {
      //given
      const organizationLearner = [
        store.createRecord('admin-organization-learner', {
          userId: 123,
        }),
      ];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearner}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });

      assert.ok(screen.getByText('123'));
      const link = within(table).getByRole('link', { name: `Voir l'utilisateur` });
      assert.ok(link.getAttribute('href').endsWith('/users/123'));
    });
    test('it should not display user link', async function (assert) {
      //given
      const organizationLearner = [
        store.createRecord('admin-organization-learner', {
          userId: undefined,
        }),
      ];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearner}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });

      assert.dom(within(table).queryByRole('link', { aria: `Voir l'utilisateur` })).doesNotExist();
    });
  });

  module('isDisabled', function () {
    test('it should display if user is active', async function (assert) {
      //given
      const organizationLearner = [
        store.createRecord('admin-organization-learner', {
          isDisabled: false,
        }),
      ];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearner}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });

      assert.dom(within(table).getByRole('img', { name: 'Actif' })).exists();
    });
    test('it should display if user is disabled', async function (assert) {
      //given
      const organizationLearner = [
        store.createRecord('admin-organization-learner', {
          isDisabled: true,
        }),
      ];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearner}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });

      assert.dom(within(table).getByRole('img', { name: 'Inactif' })).exists();
    });
  });

  module('sort', function () {
    test('it should sort by organizationName asc and desc', async function (assert) {
      //given
      const organizationLearners = [store.createRecord('admin-organization-learner')];
      const router = this.owner.lookup('service:router');

      const transitionToStub = sinon.stub(router, 'transitionTo');

      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearners}} /></template>);
      await click(screen.getByRole('button', { name: 'Trier par orga' }));

      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          organizationSort: 'asc',
          updatedAtSort: undefined,
          birthdateSort: undefined,
          pageNumber: undefined,
        },
      });

      await click(screen.getByRole('button', { name: 'Trier par orga desc' }));

      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          organizationSort: 'desc',
          updatedAtSort: undefined,
          birthdateSort: undefined,
          pageNumber: undefined,
        },
      });
      assert.ok(true);
    });
    test('it should sort by birthdate asc and desc', async function (assert) {
      //given
      const organizationLearners = [store.createRecord('admin-organization-learner')];
      const router = this.owner.lookup('service:router');

      const transitionToStub = sinon.stub(router, 'transitionTo');

      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearners}} /></template>);
      await click(screen.getByRole('button', { name: 'Trier par birthdate' }));

      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          organizationSort: undefined,
          updatedAtSort: undefined,
          birthdateSort: 'asc',
          pageNumber: undefined,
        },
      });

      await click(screen.getByRole('button', { name: 'Trier par birthdate desc' }));

      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          organizationSort: undefined,
          updatedAtSort: undefined,
          birthdateSort: 'desc',
          pageNumber: undefined,
        },
      });
      assert.ok(true);
    });
    test('it should sort by updatedAt asc and desc', async function (assert) {
      //given
      const organizationLearners = [store.createRecord('admin-organization-learner')];
      const router = this.owner.lookup('service:router');

      const transitionToStub = sinon.stub(router, 'transitionTo');

      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearners}} /></template>);
      await click(screen.getByRole('button', { name: 'Trier par date maj' }));

      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          organizationSort: undefined,
          updatedAtSort: 'asc',
          birthdateSort: undefined,
          pageNumber: undefined,
        },
      });

      await click(screen.getByRole('button', { name: 'Trier par date maj desc' }));

      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          organizationSort: undefined,
          updatedAtSort: 'desc',
          birthdateSort: undefined,
          pageNumber: undefined,
        },
      });
      assert.ok(true);
    });
  });
});
