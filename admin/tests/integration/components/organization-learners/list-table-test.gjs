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

  test('it displays column headers', async function (assert) {
    // given
    const organizationLearners = [store.createRecord('admin-organization-learner')];

    // when
    const screen = await render(<template><ListTable @organizationLearners={{organizationLearners}} /></template>);

    // then
    const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });
    assert
      .dom(
        within(table).getByRole('checkbox', {
          name: t('components.organization-learners.list-table.headers.main-checkbox'),
        }),
      )
      .exists();
    assert.dom(within(table).getByRole('columnheader', { name: t('common.fields.id') })).exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: t('components.organization-learners.list-table.headers.first-name'),
        }),
      )
      .exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: t('components.organization-learners.list-table.headers.last-name'),
        }),
      )
      .exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: new RegExp(t('components.organization-learners.list-table.headers.organization')),
        }),
      )
      .exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: new RegExp(t('components.organization-learners.list-table.headers.birthdate')),
        }),
      )
      .exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: t('components.organization-learners.list-table.headers.national-student-id'),
        }),
      )
      .exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: t('components.organization-learners.list-table.headers.division-group'),
        }),
      )
      .exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: t('components.organization-learners.list-table.headers.user-id'),
        }),
      )
      .exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: t('components.organization-learners.list-table.headers.active'),
        }),
      )
      .exists();
    assert
      .dom(
        within(table).getByRole('columnheader', {
          name: new RegExp(t('components.organization-learners.list-table.headers.updated-at')),
        }),
      )
      .exists();
  });

  test('it displays organization learners data in list', async function (assert) {
    // given
    const organizationLearners = [
      store.createRecord('admin-organization-learner', {
        id: 321,
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

    assert.ok(screen.getByText('321'));
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

  module('learner link', function () {
    test('it should display learner link', async function (assert) {
      //given
      const organizationLearner = store.createRecord('admin-organization-learner', {
        id: 456,
        userId: 123,
        firstName: 'bob',
        lastName: 'Henri',
      });
      const organizationLearners = [organizationLearner];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearners}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });

      const link = within(table).getByRole('link', {
        name: t('components.organization-learners.list-table.view-learner', { learner: organizationLearner.fullName }),
      });
      assert.ok(link.getAttribute('href').endsWith('456'));
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

      assert.dom(within(table).queryByRole('link', { name: `Voir l'utilisateur` })).doesNotExist();
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

  module('checkboxes', function () {
    test('it displays learner checkbox', async function (assert) {
      //given
      const organizationLearners = [
        store.createRecord('admin-organization-learner', {
          firstName: 'firstname1',
          lastName: 'lastname1',
        }),
        store.createRecord('admin-organization-learner', {
          firstName: 'firstname2',
          lastName: 'lastname2',
        }),
      ];

      //when
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearners}} /></template>);

      // then
      const table = screen.getByRole('table', { name: t('components.organization-learners.list-table.caption') });
      const checkbox1 = within(table).getByRole('checkbox', {
        name: t('components.organization-learners.list-table.checkbox', {
          firstname: organizationLearners[0].firstName,
          lastname: organizationLearners[0].lastName,
        }),
      });
      const checkbox2 = within(table).getByRole('checkbox', {
        name: t('components.organization-learners.list-table.checkbox', {
          firstname: organizationLearners[0].firstName,
          lastname: organizationLearners[0].lastName,
        }),
      });

      assert.dom(checkbox1).exists();
      assert.dom(checkbox2).exists();
    });
    test('it toggles learner on checkbox click', async function (assert) {
      // given
      const organizationLearners = [
        store.createRecord('admin-organization-learner', {
          firstName: 'firstname1',
          lastName: 'lastname1',
        }),
      ];
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearners}} /></template>);

      // when
      const checkbox = screen.getByRole('checkbox', {
        name: t('components.organization-learners.list-table.checkbox', {
          firstname: organizationLearners[0].firstName,
          lastname: organizationLearners[0].lastName,
        }),
      });

      await click(checkbox);

      // then
      assert.dom(checkbox).isChecked();

      // rewhen
      await click(checkbox);

      // rethen
      assert.dom(checkbox).isNotChecked();
    });

    test('it toggles all learners on header checkbox click', async function (assert) {
      // given
      const organizationLearners = [
        store.createRecord('admin-organization-learner', {
          firstName: 'firstname1',
          lastName: 'lastname1',
        }),
        store.createRecord('admin-organization-learner', {
          firstName: 'firstname2',
          lastName: 'lastname2',
        }),
      ];
      const screen = await render(<template><ListTable @organizationLearners={{organizationLearners}} /></template>);

      // when
      const headerCheckbox = screen.getByRole('checkbox', {
        name: t('components.organization-learners.list-table.headers.main-checkbox'),
      });
      const checkbox1 = screen.getByRole('checkbox', {
        name: t('components.organization-learners.list-table.checkbox', {
          firstname: organizationLearners[0].firstName,
          lastname: organizationLearners[0].lastName,
        }),
      });
      const checkbox2 = screen.getByRole('checkbox', {
        name: t('components.organization-learners.list-table.checkbox', {
          firstname: organizationLearners[1].firstName,
          lastname: organizationLearners[1].lastName,
        }),
      });

      await click(headerCheckbox);

      // then
      assert.dom(headerCheckbox).isChecked();
      assert.dom(checkbox1).isChecked();
      assert.dom(checkbox2).isChecked();

      // rewhen
      await click(headerCheckbox);

      // rethen
      assert.dom(headerCheckbox).isNotChecked();
      assert.dom(checkbox1).isNotChecked();
      assert.dom(checkbox2).isNotChecked();
    });
  });
});
