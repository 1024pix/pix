import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import ListTable from 'pix-admin/components/organization-learners/list-table';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { waitForDialogClose } from '../../../helpers/wait-for';

const selectLearnerLabel = (firstname, lastname) =>
  t('components.organization-learners.list-table.select-learner', { firstname, lastname });

module('Integration | Component | OrganizationLearners | ListTable', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    this.organizationLearners = [
      store.createRecord('admin-organization-learner', {
        firstName: 'bob',
        lastName: 'Henri',
      }),
      store.createRecord('admin-organization-learner', {
        firstName: 'alice',
        lastName: 'Martin',
      }),
      store.createRecord('admin-organization-learner', {
        firstName: 'jules',
        lastName: 'Dupont',
      }),
    ];
  });

  test('it should display organization learners list', async function (assert) {
    //given
    const learners = [
      store.createRecord('admin-organization-learner', {
        id: '321',
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

    //when
    const screen = await render(<template><ListTable @organizationLearners={{learners}} /></template>);

    //then
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

      //then
      assert.dom(screen.getByRole('cell', { name: '6e' })).exists();
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

      //then
      assert.dom(screen.getByRole('cell', { name: 'Groupe A' })).exists();
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

      //then
      assert.ok(screen.getByText('Orga'));
      const link = screen.getByRole('link', {
        name: t('components.organization-learners.list-table.view-organization'),
      });
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

      //then
      assert
        .dom(screen.queryByRole('link', { name: t('components.organization-learners.list-table.view-organization') }))
        .doesNotExist();
    });
  });

  module('learner link', function () {
    test('it should display learner link', async function (assert) {
      //given
      const learners = [
        store.createRecord('admin-organization-learner', {
          id: '456',
          userId: 123,
          firstName: 'bob',
          lastName: 'Henri',
        }),
      ];
      //when
      const screen = await render(<template><ListTable @organizationLearners={{learners}} /></template>);

      //then
      const link = screen.getByRole('link', {
        name: t('components.organization-learners.list-table.view-learner', { learner: 'bob Henri' }),
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

      //then
      assert.ok(screen.getByText('123'));
      const link = screen.getByRole('link', { name: t('components.organization-learners.list-table.view-user') });
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

      //then
      assert
        .dom(screen.queryByRole('link', { name: t('components.organization-learners.list-table.view-user') }))
        .doesNotExist();
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

      //then
      assert
        .dom(screen.getByRole('img', { name: t('components.organization-learners.list-table.headers.active') }))
        .exists();
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

      //then
      assert
        .dom(screen.getByRole('img', { name: t('components.organization-learners.list-table.headers.inactive') }))
        .exists();
    });
  });

  module('sort', function (hooks) {
    let router;
    let transitionToStub;

    hooks.beforeEach(async function () {
      //given
      router = this.owner.lookup('service:router');
      transitionToStub = sinon.stub(router, 'transitionTo');
    });

    test('it should sort by organizationName asc and desc', async function (assert) {
      //when
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );
      await click(
        screen.getByRole('button', {
          name: t('components.organization-learners.list-table.sort.organization.default'),
        }),
      );

      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          organizationSort: 'asc',
          updatedAtSort: undefined,
          birthdateSort: undefined,
          pageNumber: undefined,
        },
      });

      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.sort.organization.desc') }),
      );

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
      //when
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.sort.birthdate.default') }),
      );

      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          organizationSort: undefined,
          updatedAtSort: undefined,
          birthdateSort: 'asc',
          pageNumber: undefined,
        },
      });

      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.sort.birthdate.desc') }),
      );

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
      //when
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.sort.updated-at.default') }),
      );

      sinon.assert.calledWith(transitionToStub, {
        queryParams: {
          organizationSort: undefined,
          updatedAtSort: 'asc',
          birthdateSort: undefined,
          pageNumber: undefined,
        },
      });

      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.sort.updated-at.desc') }),
      );

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

  module('reset selected learners', function (hooks) {
    hooks.beforeEach(async function () {
      //given
      const router = this.owner.lookup('service:router');
      sinon.stub(router, 'transitionTo');
      sinon.stub(router, 'replaceWith');
    });

    test('it resets selected learners checkboxes on sort', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );

      //when
      const checkbox = screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') });
      await click(checkbox);
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.sort.updated-at.default') }),
      );

      //then
      assert.dom(checkbox).isNotChecked();
    });

    test('it resets selected learners checkboxes on filter change', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );

      //when
      const checkbox = screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') });
      await click(checkbox);

      await click(screen.getByRole('button', { name: t('common.filters.actions.load') }));

      //then
      assert.dom(checkbox).isNotChecked();
    });

    test('it resets selected learners checkboxes on pagination change', async function (assert) {
      //given
      const learners = [
        store.createRecord('admin-organization-learner', {
          firstName: 'bob',
          lastName: 'Henri',
        }),
        store.createRecord('admin-organization-learner'),
        store.createRecord('admin-organization-learner'),
      ];
      learners.meta = { page: 1, pageSize: 2, rowCount: 3, pageCount: 2 };
      const screen = await render(<template><ListTable @organizationLearners={{learners}} /></template>);

      //when
      const checkbox = screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') });
      await click(checkbox);
      await click(screen.getByRole('button', { name: t('common.pagination.nextPage') }));

      //then
      assert.dom(checkbox).isNotChecked();
    });
  });

  module('checkbox', function () {
    test('it displays checkboxes', async function (assert) {
      //when
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );

      //then
      assert
        .dom(
          screen.getByRole('checkbox', { name: t('components.organization-learners.list-table.headers.select-all') }),
        )
        .exists();
      assert.dom(screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') })).exists();
      assert.dom(screen.getByRole('checkbox', { name: selectLearnerLabel('alice', 'Martin') })).exists();
      assert.dom(screen.getByRole('checkbox', { name: selectLearnerLabel('jules', 'Dupont') })).exists();
    });

    test('it toggles one learner checkbox', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );
      const learnerCheckbox = screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') });
      const otherLearnerCheckbox = screen.getByRole('checkbox', {
        name: selectLearnerLabel('alice', 'Martin'),
      });

      //when
      await click(learnerCheckbox);

      //then
      assert.dom(learnerCheckbox).isChecked();
      assert.dom(otherLearnerCheckbox).isNotChecked();

      //when
      await click(learnerCheckbox);

      //then
      assert.dom(learnerCheckbox).isNotChecked();
      assert.dom(otherLearnerCheckbox).isNotChecked();
    });

    test('it toggles all learner checkboxes', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );

      const selectAllCheckbox = screen.getByRole('checkbox', {
        name: t('components.organization-learners.list-table.headers.select-all'),
      });
      const firstLearnerCheckbox = screen.getByRole('checkbox', {
        name: selectLearnerLabel('bob', 'Henri'),
      });
      const secondLearnerCheckbox = screen.getByRole('checkbox', {
        name: selectLearnerLabel('alice', 'Martin'),
      });
      const thirdLearnerCheckbox = screen.getByRole('checkbox', {
        name: selectLearnerLabel('jules', 'Dupont'),
      });

      //when
      await click(selectAllCheckbox);

      //then
      assert.dom(selectAllCheckbox).isChecked();
      assert.dom(firstLearnerCheckbox).isChecked();
      assert.dom(secondLearnerCheckbox).isChecked();
      assert.dom(thirdLearnerCheckbox).isChecked();

      //rewhen
      await click(selectAllCheckbox);

      //rethen
      assert.dom(selectAllCheckbox).isNotChecked();
      assert.dom(firstLearnerCheckbox).isNotChecked();
      assert.dom(secondLearnerCheckbox).isNotChecked();
      assert.dom(thirdLearnerCheckbox).isNotChecked();
    });

    test('it untoggles all learner checkboxes if some are selected', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );

      const selectAllCheckbox = screen.getByRole('checkbox', {
        name: t('components.organization-learners.list-table.headers.select-all'),
      });
      const firstLearnerCheckbox = screen.getByRole('checkbox', {
        name: selectLearnerLabel('bob', 'Henri'),
      });
      const secondLearnerCheckbox = screen.getByRole('checkbox', {
        name: selectLearnerLabel('alice', 'Martin'),
      });
      const thirdLearnerCheckbox = screen.getByRole('checkbox', {
        name: selectLearnerLabel('jules', 'Dupont'),
      });

      //when
      await click(firstLearnerCheckbox);
      await click(secondLearnerCheckbox);
      await click(selectAllCheckbox);

      //then
      assert.dom(selectAllCheckbox).isNotChecked();
      assert.dom(firstLearnerCheckbox).isNotChecked();
      assert.dom(secondLearnerCheckbox).isNotChecked();
      assert.dom(thirdLearnerCheckbox).isNotChecked();
    });
  });

  module('action bar', function () {
    test('it does not display action bar if no learner selected', async function (assert) {
      //when
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );

      //then
      assert
        .dom(screen.queryByText(t('components.organization-learners.list-table.action-bar.information', { count: 1 })))
        .doesNotExist();
      assert
        .dom(
          screen.queryByRole('button', {
            name: t('components.organization-learners.list-table.action-bar.delete-button'),
          }),
        )
        .doesNotExist();
    });

    test('it displays action bar with the right amount of learners selected', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );

      //when
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') }));

      //then
      assert
        .dom(screen.getByText(t('components.organization-learners.list-table.action-bar.information', { count: 1 })))
        .exists();
      assert
        .dom(
          screen.getByRole('button', {
            name: t('components.organization-learners.list-table.action-bar.delete-button'),
          }),
        )
        .exists();

      //when
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('alice', 'Martin') }));

      //then
      assert
        .dom(screen.getByText(t('components.organization-learners.list-table.action-bar.information', { count: 2 })))
        .exists();
    });

    test('it opens deletion modal', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') }));

      //when
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.action-bar.delete-button') }),
      );

      //then
      assert
        .dom(
          await screen.findByRole('dialog', {
            name: t('components.organization-learners.list-table.deletion-modal.title'),
          }),
        )
        .exists();
    });
  });

  module('deletion modal', function () {
    test('it does not show deletion modal by default', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );

      //then
      assert
        .dom(
          await screen.queryByRole('dialog', {
            name: t('components.organization-learners.list-table.deletion-modal.title'),
          }),
        )
        .doesNotExist();
    });

    test('it closes modal on exit button click', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') }));
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.action-bar.delete-button') }),
      );

      //when
      await click(screen.getByRole('button', { name: t('common.actions.cancel') }));
      await waitForDialogClose();

      //then
      assert
        .dom(
          await screen.queryByRole('dialog', {
            name: t('components.organization-learners.list-table.deletion-modal.title'),
          }),
        )
        .doesNotExist();
    });

    test('it shows the right amount of learner selected in deletion modal', async function (assert) {
      //given
      const screen = await render(
        <template><ListTable @organizationLearners={{this.organizationLearners}} /></template>,
      );

      //when
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') }));
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.action-bar.delete-button') }),
      );

      //then
      assert
        .dom(
          screen.getByText(
            t('components.organization-learners.list-table.deletion-modal.warning-message', { count: 1 }),
          ),
        )
        .exists();

      //when
      await click(screen.getByRole('button', { name: t('common.actions.cancel') }));
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('alice', 'Martin') }));
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('jules', 'Dupont') }));
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.action-bar.delete-button') }),
      );

      //then
      assert
        .dom(
          screen.getByText(
            t('components.organization-learners.list-table.deletion-modal.warning-message', { count: 3 }),
          ),
        )
        .exists();
    });
  });

  module('delete learner', function (hooks) {
    let router;
    let adapter;
    let deleteAdapterStub;
    let notificationSuccessStub;
    let notificationErrorStub;

    hooks.beforeEach(async function () {
      router = this.owner.lookup('service:router');
      adapter = store.adapterFor('organization-learner');
      sinon.stub(router, 'refresh');
      deleteAdapterStub = sinon.stub(adapter, 'deleteOrganizationLearners');
      notificationSuccessStub = sinon.stub();
      notificationErrorStub = sinon.stub();

      class NotificationsStub extends Service {
        sendSuccessNotification = notificationSuccessStub;
        sendErrorNotification = notificationErrorStub;
      }
      this.owner.register('service:pixToast', NotificationsStub);
    });

    test('it hides modal and resets selected organization learners after deletion', async function (assert) {
      //given
      const learnersWithIds = [
        store.createRecord('admin-organization-learner', { id: '123', firstName: 'bob', lastName: 'Henri' }),
        store.createRecord('admin-organization-learner', { id: '456', firstName: 'alice', lastName: 'Martin' }),
      ];
      const screen = await render(<template><ListTable @organizationLearners={{learnersWithIds}} /></template>);

      deleteAdapterStub.withArgs(['123']).resolves();

      //when
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') }));
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.action-bar.delete-button') }),
      );
      await click(
        screen.getByRole('checkbox', {
          name: t('common.actions.are-you-sure'),
        }),
      );
      await click(screen.getByRole('button', { name: t('common.actions.confirm-deletion') }));
      await waitForDialogClose();

      //then
      assert
        .dom(
          await screen.queryByRole('dialog', {
            name: t('components.organization-learners.list-table.deletion-modal.title'),
          }),
        )
        .doesNotExist();
      assert
        .dom(
          screen.getByRole('checkbox', {
            name: t('components.organization-learners.list-table.headers.select-all'),
          }),
        )
        .isNotChecked();
      assert.dom(screen.getByRole('checkbox', { name: selectLearnerLabel('alice', 'Martin') })).isNotChecked();
    });

    test('it deletes one selected organization learners', async function (assert) {
      //given
      const learnersWithIds = [
        store.createRecord('admin-organization-learner', { id: '123', firstName: 'bob', lastName: 'Henri' }),
        store.createRecord('admin-organization-learner', { id: '456', firstName: 'alice', lastName: 'Martin' }),
      ];
      const screen = await render(<template><ListTable @organizationLearners={{learnersWithIds}} /></template>);

      deleteAdapterStub.withArgs(['123']).resolves();

      //when
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') }));
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.action-bar.delete-button') }),
      );
      await click(
        screen.getByRole('checkbox', {
          name: t('common.actions.are-you-sure'),
        }),
      );
      await click(screen.getByRole('button', { name: t('common.actions.confirm-deletion') }));

      //then
      assert.ok(
        notificationSuccessStub.calledWith({
          message: t('components.organization-learners.list-table.deletion-modal.success-message', { count: 1 }),
        }),
      );
    });

    test('it displays an error toast if deletion rejects', async function (assert) {
      //given
      const learnersWithIds = [
        store.createRecord('admin-organization-learner', { id: '123', firstName: 'bob', lastName: 'Henri' }),
        store.createRecord('admin-organization-learner', { id: '456', firstName: 'alice', lastName: 'Martin' }),
      ];
      const screen = await render(<template><ListTable @organizationLearners={{learnersWithIds}} /></template>);

      deleteAdapterStub.withArgs(['123']).rejects();

      //when
      await click(screen.getByRole('checkbox', { name: selectLearnerLabel('bob', 'Henri') }));
      await click(
        screen.getByRole('button', { name: t('components.organization-learners.list-table.action-bar.delete-button') }),
      );
      await click(
        screen.getByRole('checkbox', {
          name: t('common.actions.are-you-sure'),
        }),
      );
      await click(screen.getByRole('button', { name: t('common.actions.confirm-deletion') }));

      //then
      assert.ok(
        notificationErrorStub.calledWith({
          message: t('common.api-error-messages.internal-server-error'),
        }),
      );
    });
  });
});
