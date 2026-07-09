import { render, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CombinedCourseParticipations from 'pix-orga/components/combined-course/participations';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | combined-course/participations', function (hooks) {
  const participations = [
    {
      id: 123,
      firstName: 'Marcelle',
      lastName: 'Labe',
      status: 'COMPLETED',
      division: '6eme A',
      group: 'Groupe 1',
      nbCampaigns: 3,
      nbModules: 5,
      nbCampaignsCompleted: 2,
      nbModulesCompleted: 2,
      rewardStatus: 'OBTAINED',
    },
    {
      id: 234,
      firstName: 'Vincent',
      lastName: 'Deli',
      status: 'STARTED',
      division: '5eme B',
      group: 'Groupe 2',
      nbCampaigns: 2,
      nbModules: 2,
      nbCampaignsCompleted: 0,
      nbModulesCompleted: 0,
      rewardStatus: 'NOT_OBTAINED',
    },
  ];
  participations.meta = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };
  const onFilter = sinon.stub();

  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    const currentUser = this.owner.lookup('service:current-user');
    currentUser.organization = {
      isManagingStudents: false,
      isSco: false,
    };
    store = this.owner.lookup('service:store');
  });

  module('table', function (hooks) {
    let router;

    hooks.beforeEach(function () {
      router = this.owner.lookup('service:router');
      router.transitionTo = sinon.stub();
    });

    test('it should have a caption to describe the table ', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('table', { name: t('pages.combined-course.table.description') }));
    });

    test('it should display column headers', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
          />
        </template>,
      );

      const table = screen.getByRole('table');

      // then
      assert.ok(
        within(table).getByRole('columnheader', {
          name: t('pages.combined-course.table.column.first-name'),
        }),
      );
      assert.ok(
        within(table).getByRole('columnheader', {
          name: t('pages.combined-course.table.column.last-name'),
        }),
      );
      assert.ok(
        within(table).getByRole('columnheader', {
          name: t('pages.combined-course.table.column.status'),
        }),
      );
      assert.ok(
        within(table).getByRole('columnheader', {
          name: new RegExp(t('pages.combined-course.table.column.campaigns')),
        }),
      );
      assert.ok(
        within(table).getByRole('columnheader', {
          name: new RegExp(t('pages.combined-course.table.column.modules')),
        }),
      );
    });

    test('it should not display campaigns column when no campaigns on combined course', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{false}}
            @hasModules={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
          />
        </template>,
      );

      const table = screen.getByRole('table');

      // then
      assert.notOk(
        within(table).queryByRole('columnheader', {
          name: new RegExp(t('pages.combined-course.table.column.campaigns')),
        }),
      );
      assert.ok(
        within(table).getByRole('columnheader', {
          name: new RegExp(t('pages.combined-course.table.column.modules')),
        }),
      );
    });

    test('it should not display modules column when no modules on combined course', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{false}}
            @participations={{participations}}
            @onFilter={{onFilter}}
          />
        </template>,
      );

      const table = screen.getByRole('table');

      // then
      assert.notOk(
        within(table).queryByRole('columnheader', {
          name: new RegExp(t('pages.combined-course.table.column.modules')),
        }),
      );
      assert.ok(
        within(table).getByRole('columnheader', {
          name: new RegExp(t('pages.combined-course.table.column.campaigns')),
        }),
      );
    });

    test('it should render a tooltip for campaign column', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            onFilter={{onFilter}}
          />
        </template>,
      );
      const campaignHeader = screen.getByRole('columnheader', {
        name: new RegExp(t('pages.combined-course.table.column.campaigns')),
      });

      // then
      assert.ok(within(campaignHeader).getByText(t('pages.combined-course.table.tooltip.campaigns-column')));
    });

    test('it should render a tooltip for module column', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            onFilter={{onFilter}}
          />
        </template>,
      );
      const campaignHeader = screen.getByRole('columnheader', {
        name: new RegExp(t('pages.combined-course.table.column.modules')),
      });

      // then
      assert.ok(within(campaignHeader).getByText(t('pages.combined-course.table.tooltip.modules-column')));
    });

    test('it should transition to participation detail when clicking on a row', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
          />
        </template>,
      );

      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      // Skip header row, click on first data row
      await click(rows[1]);

      // then
      assert.true(router.transitionTo.calledOnce);
      assert.true(
        router.transitionTo.calledWith('authenticated.combined-course.participation-detail', participations[0].id),
      );
    });

    test('it should display attestation column when there is a reward linked to the combined course', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @hasReward={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
          />
        </template>,
      );

      const table = screen.getByRole('table');

      // then
      assert.ok(
        within(table).getByRole('columnheader', {
          name: t('pages.combined-course.table.column.reward'),
        }),
      );
    });

    test('it should not display attestation column when there is no reward linked to the combined course', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @hasReward={{false}}
            @participations={{participations}}
            @onFilter={{onFilter}}
          />
        </template>,
      );

      const table = screen.getByRole('table');

      // then
      assert.notOk(
        within(table).queryByRole('columnheader', {
          name: t('pages.combined-course.table.column.reward'),
        }),
      );
    });
  });

  test('it should display participation details', async function (assert) {
    // when
    const participationRecords = [
      store.createRecord('combined-course-participation', participations[0]),
      store.createRecord('combined-course-participation', participations[1]),
    ];
    const screen = await render(
      <template>
        <CombinedCourseParticipations
          @hasCampaigns={{true}}
          @hasModules={{true}}
          @participations={{participationRecords}}
          @onFilter={{onFilter}}
          @hasReward={{true}}
        />
      </template>,
    );

    const table = screen.getByRole('table');
    // then
    assert.ok(
      within(table).getByRole('cell', {
        name: participations[0].lastName,
      }),
    );
    assert.ok(
      within(table).getByRole('cell', {
        name: participations[0].firstName,
      }),
    );
    assert.ok(
      within(table).getByRole('cell', {
        name: t(`components.participation-status.${participations[0].status}`),
      }),
    );
    assert.ok(
      within(table).getByText(
        t('pages.combined-course.table.campaign-completion', {
          nbItemsCompleted: participations[0].nbCampaignsCompleted,
          nbItems: participations[0].nbCampaigns,
        }),
      ),
    );
    assert.ok(
      within(table).getByText(
        t('pages.combined-course.table.module-completion', {
          nbItemsCompleted: participations[0].nbModulesCompleted,
          nbItems: participations[0].nbModules,
        }),
      ),
    );
    //obtained
    assert.ok(
      within(table).getByRole('cell', {
        name: t('pages.combined-course.table.rewards.obtained'),
      }),
    );
    // not obtained
    assert.ok(
      within(table).getByRole('cell', {
        name: t('pages.combined-course.table.rewards.not-obtained'),
      }),
    );
  });

  test('it should display empty state', async function (assert) {
    // given
    const noParticipation = [];

    // when
    const screen = await render(
      <template>
        <CombinedCourseParticipations
          @hasCampaigns={{true}}
          @hasModules={{true}}
          @participations={{noParticipation}}
          @onFilter={{onFilter}}
        />
      </template>,
    );

    // then
    assert.notOk(screen.queryByRole('table'));
    assert.ok(screen.getByText(t('pages.campaign.empty-state')));
  });

  module('pagination', function () {
    test('it should display pagination in correct language', async function (assert) {
      // when
      const locale = this.owner.lookup('service:locale');
      locale.setCurrentLocale('en');
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByLabelText(/items/));
    });
    test('should display pagination', async function (assert) {
      //when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(/1-1 sur 2 éléments/));
      assert.ok(screen.getByLabelText("Nombre d'élément à afficher par page"));
      assert.ok(screen.getByRole('button', { name: 'Aller à la page précédente' }));
      assert.ok(screen.getByRole('button', { name: 'Aller à la page suivante' }));
    });
  });

  module('filters', function () {
    module('clearFilters', function () {
      test('it should trigger clearFilters', async function (assert) {
        // given
        const clearFilters = sinon.stub();

        const statusesFilter = [];

        // when
        const screen = await render(
          <template>
            <CombinedCourseParticipations
              @hasCampaigns={{true}}
              @hasModules={{true}}
              @statusesFilter={{statusesFilter}}
              @clearFilters={{clearFilters}}
              @participations={{participations}}
              @onFilter={{onFilter}}
            />
          </template>,
        );

        await screen.getByRole('button', { name: t('common.filters.actions.clear') }).click();

        // then
        assert.true(clearFilters.calledOnce);
      });
    });

    module('fullName filter', function () {
      test('it should trigger onFilter on fullName change', async function (assert) {
        // given
        const onFilter = sinon.stub();
        const fullNameFilter = '';

        // when
        const screen = await render(
          <template>
            <CombinedCourseParticipations
              @hasCampaigns={{true}}
              @hasModules={{true}}
              @fullNameFilter={{fullNameFilter}}
              @onFilter={{onFilter}}
              @participations={{participations}}
            />
          </template>,
        );

        const input = screen.getByLabelText(t('common.filters.fullname.label'));

        assert.ok(screen.getByPlaceholderText(t('common.filters.fullname.placeholder')));

        await fillIn(input, 'marcelle');

        // then
        assert.true(onFilter.calledOnce);
        assert.deepEqual(onFilter.args[0], ['fullName', 'marcelle']);
      });

      test('it should init the fullName filter value', async function (assert) {
        // given
        const fullNameFilter = 'Marcelo';

        // when
        const screen = await render(
          <template>
            <CombinedCourseParticipations
              @hasCampaigns={{true}}
              @hasModules={{true}}
              @fullNameFilter={{fullNameFilter}}
              @onFilter={{onFilter}}
              @participations={{participations}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByDisplayValue('Marcelo'));
      });
    });

    module('statuses filter', function () {
      test('it should trigger onFilter on statuses change', async function (assert) {
        // given
        const onFilter = sinon.stub();
        const statusesFilter = [];

        // when
        const screen = await render(
          <template>
            <CombinedCourseParticipations
              @hasCampaigns={{true}}
              @hasModules={{true}}
              @statusesFilter={{statusesFilter}}
              @onFilter={{onFilter}}
              @participations={{participations}}
            />
          </template>,
        );

        const select = screen.getByLabelText(t('pages.combined-course.filters.by-status'));

        await click(select);
        await screen.findByRole('menu');
        await click(screen.getByLabelText(t('pages.combined-course.filters.status.COMPLETED')));

        // then
        assert.true(onFilter.calledOnce);
        assert.deepEqual(onFilter.args[0], ['statuses', ['COMPLETED']]);
      });
    });
  });

  module('division and group column', function (hooks) {
    let currentUser;

    hooks.beforeEach(function () {
      currentUser = this.owner.lookup('service:current-user');
    });

    test('it should display division column for SCO organizations if organisation is managing students', async function (assert) {
      // given
      currentUser.organization = {
        isManagingStudents: true,
        isSco: true,
      };
      const divisions = [];

      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
            @divisions={{divisions}}
          />
        </template>,
      );

      const table = screen.getByRole('table');

      // then
      assert.ok(
        within(table).getByRole('columnheader', {
          name: t('components.group.SCO'),
        }),
      );
      assert.ok(
        within(table).getByRole('cell', {
          name: participations[0].division,
        }),
      );
    });

    test('it should display group column for SUP organizations with is managing students', async function (assert) {
      // given
      currentUser.organization = {
        isManagingStudents: true,
        isSco: false,
      };
      const divisions = [];

      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
            @divisions={{divisions}}
          />
        </template>,
      );

      const table = screen.getByRole('table');

      // then
      assert.ok(
        within(table).getByRole('columnheader', {
          name: t('components.group.SUP'),
        }),
      );
      assert.ok(
        within(table).getByRole('cell', {
          name: participations[0].group,
        }),
      );
    });

    test('it should not display division/group column when organization is not managing students', async function (assert) {
      // given
      currentUser.organization = {
        isManagingStudents: false,
        isSco: true,
      };
      const divisions = [];

      // when
      const screen = await render(
        <template>
          <CombinedCourseParticipations
            @hasCampaigns={{true}}
            @hasModules={{true}}
            @participations={{participations}}
            @onFilter={{onFilter}}
            @divisions={{divisions}}
          />
        </template>,
      );

      const table = screen.getByRole('table');

      // then
      assert.notOk(
        within(table).queryByRole('columnheader', {
          name: t('components.group.SCO'),
        }),
      );
      assert.notOk(
        within(table).queryByRole('columnheader', {
          name: t('components.group.SUP'),
        }),
      );
    });
  });
});
