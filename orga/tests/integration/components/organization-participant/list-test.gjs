/* eslint-disable ember/template-no-let-reference */
import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import List from 'pix-orga/components/organization-participant/list';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationParticipant | List', function (hooks) {
  let noop, certificabilityFilter, fullNameFilter;
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const organization = store.createRecord('organization');

    class CurrentUserStub extends Service {
      organization = organization;
    }

    this.owner.register('service:current-user', CurrentUserStub);
    noop = sinon.stub();
    certificabilityFilter = [];
    fullNameFilter = null;
  });

  test('it should have a caption to describe the table ', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        id: 34,
      },
    ];

    // when
    const screen = await render(
      <template>
        <List
          @participants={{participants}}
          @triggerFiltering={{noop}}
          @onClickLearner={{noop}}
          @fullName={{fullNameFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByRole('table', { name: t('pages.organization-participants.table.description') }));
  });

  module('header', function () {
    test('it should display common header labels', async function (assert) {
      // given
      const participants = [];
      // when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      assert.ok(
        screen.getByRole('columnheader', {
          name: new RegExp('\\b' + t('pages.organization-participants.table.column.last-name.label') + '\\b'),
        }),
      );
      assert.ok(
        screen.getByRole('columnheader', { name: t('pages.organization-participants.table.column.first-name') }),
      );
      assert.ok(
        screen.getByRole('columnheader', {
          name: new RegExp(t('pages.organization-participants.table.column.latest-participation.label')),
        }),
      );
      assert.ok(
        screen.getByRole('columnheader', {
          name: new RegExp(t('pages.organization-participants.table.column.participation-count.label')),
        }),
      );
    });

    module('Import Feature cases', function () {
      test('it should display extra header when import feature available enabled', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          hasLearnerImportFeature = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const participants = [];
        participants.meta = {
          headingCustomColumns: ['awesome.column'],
        };
        // when
        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
            />
          </template>,
        );
        // then
        assert.ok(screen.getByRole('columnheader', { name: t('awesome.column') }));
      });

      test('it should not display extra header when import feature available disabled', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          hasLearnerImportFeature = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const participants = [];
        participants.meta = {
          headingCustomColumns: ['awesome.column'],
        };

        // when
        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
            />
          </template>,
        );
        // then
        assert.notOk(screen.queryByRole('columnheader', { name: t('awesome.column') }));
      });
    });
  });

  module('row', function () {
    test('it should display a list of participants', async function (assert) {
      // given
      const participants = [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          lastParticipationDate: null,
          id: 34,
        },
        {
          lastName: "L'asticot",
          firstName: 'Gogo',
          lastParticipationDate: new Date('2024-01-05'),
          id: 56,
        },
      ];

      // when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      // row include heading line
      assert.strictEqual(screen.getAllByRole('row').length, 3);
    });

    module('lastParticipationDate', function () {
      test('it should display participation date', async function (assert) {
        // given
        const intl = this.owner.lookup('service:intl');
        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
            lastParticipationDate: '2024-01-04',
            id: 34,
          },
        ];

        // when
        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByRole('cell', { name: intl.formatDate('2024-01-04') }));
      });
    });

    module('custom row', function () {
      test('should display custom row for learner when import feature enabled', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          hasLearnerImportFeature = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
            extraColumns: {
              'awesome.column': 'drawing',
            },
            id: 34,
          },
        ];

        participants.meta = {
          headingCustomColumns: ['awesome.column'],
        };

        // when
        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByRole('cell', { name: 'drawing' }));
      });

      test('should not display custom row for learner when import feature disabled', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          hasLearnerImportFeature = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
            extraColumns: {
              'awesome.column': 'drawing',
            },
            id: 34,
          },
        ];

        participants.meta = {
          headingCustomColumns: ['awesome.column'],
        };

        // when
        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
            />
          </template>,
        );

        // then
        assert.notOk(screen.queryByText('drawing'));
      });
    });
  });

  module('filtering cases', function () {
    test('it should display the students number', async function (assert) {
      // given
      const participants = [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          id: 34,
        },
        {
          lastName: 'Terreur',
          firstName: 'Gi',
          id: 33,
        },
      ];
      participants.meta = {
        rowCount: 2,
      };

      // when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.organization-participants.filters.participations-count', { count: 2 })));
    });
    test('it should display the filter labels', async function (assert) {
      // given
      const participants = [];

      // when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByLabelText('Recherche sur le nom et prénom'));
    });

    test('it should trigger filtering with fullName search', async function (assert) {
      // given
      const participants = [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
        },
      ];
      const triggerFiltering = sinon.stub();

      // when
      await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{triggerFiltering}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );
      await fillByLabel('Recherche sur le nom et prénom', 'Karam');
      // then
      sinon.assert.calledWith(triggerFiltering, 'fullName', 'Karam');
      assert.ok(true);
    });

    test('it should trigger filtering with certificability', async function (assert) {
      // given
      const triggerFiltering = sinon.stub();
      const participants = [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
        },
      ];

      const { getByLabelText, findByRole } = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{triggerFiltering}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // when
      const select = await getByLabelText(t('pages.organization-participants.filters.type.certificability.label'));
      await click(select);
      await findByRole('menu');
      await clickByName(t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'certificability', ['eligible']);
      assert.ok(true);
    });
    module('custom filters', function () {
      module('when import feature is enabled', function (hooks) {
        const participants = [];
        hooks.beforeEach(function () {
          class CurrentUserStub extends Service {
            hasLearnerImportFeature = true;
          }
          this.owner.register('service:current-user', CurrentUserStub);
          participants.meta = {
            customFilters: ['COMMON_DIVISION'],
            headingCustomColumns: [],
          };
        });

        module('input text filter', function () {
          test('it should trigger filtering with custom filters', async function (assert) {
            // given
            const triggerFiltering = sinon.stub();

            const customFiltersValues = { COMMON_DIVISION: '' };

            await render(
              <template>
                <List
                  @participants={{participants}}
                  @triggerFiltering={{triggerFiltering}}
                  @onClickLearner={{noop}}
                  @fullName={{fullNameFilter}}
                  @customFiltersValues={{customFiltersValues}}
                  @certificabilityFilter={{certificabilityFilter}}
                />
              </template>,
            );

            // when
            await fillByLabel(t('common.import.field.division'), 'CP');

            // then
            assert.ok(triggerFiltering.calledWith('extraFilters.COMMON_DIVISION', 'CP'));
          });
        });

        module('multi select filter', function () {
          test('it should trigger filtering with custom filters', async function (assert) {
            // given
            const triggerFiltering = sinon.stub();

            const customFiltersValues = { COMMON_DIVISION: '' };
            const customFiltersOptions = [{ attributeName: 'COMMON_DIVISION', values: ['Troisième', 'Quatrième'] }];

            const screen = await render(
              <template>
                <List
                  @participants={{participants}}
                  @triggerFiltering={{triggerFiltering}}
                  @onClickLearner={{noop}}
                  @fullName={{fullNameFilter}}
                  @customFiltersValues={{customFiltersValues}}
                  @customFiltersOptions={{customFiltersOptions}}
                  @certificabilityFilter={{certificabilityFilter}}
                />
              </template>,
            );

            // when
            await click(screen.getByRole('button', { name: t('common.import.field.division') }));

            await screen.findByRole('menu');

            await click(screen.getByRole('checkbox', { name: 'Troisième' }));

            // then
            assert.ok(triggerFiltering.calledWith('extraFilters.COMMON_DIVISION', ['Troisième']));
          });

          test('it should prefill data on custom filters', async function (assert) {
            // given
            const triggerFiltering = sinon.stub();

            const customFiltersValues = { COMMON_DIVISION: 'Quatrième' };
            const customFiltersOptions = [{ attributeName: 'COMMON_DIVISION', values: ['Troisième', 'Quatrième'] }];

            const screen = await render(
              <template>
                <List
                  @participants={{participants}}
                  @triggerFiltering={{triggerFiltering}}
                  @onClickLearner={{noop}}
                  @fullName={{fullNameFilter}}
                  @customFiltersValues={{customFiltersValues}}
                  @customFiltersOptions={{customFiltersOptions}}
                  @certificabilityFilter={{certificabilityFilter}}
                />
              </template>,
            );

            // when
            await click(screen.getByRole('button', { name: t('common.import.field.division') }));

            await screen.findByRole('menu');

            // then
            assert.dom(screen.getByRole('checkbox', { name: 'Quatrième' })).isChecked();
            assert.dom(screen.getByRole('checkbox', { name: 'Troisième' })).isNotChecked();
          });
        });
      });

      module('when import feature is disabled', function (hooks) {
        const participants = [];
        hooks.beforeEach(function () {
          class CurrentUserStub extends Service {
            hasLearnerImportFeature = false;
          }
          this.owner.register('service:current-user', CurrentUserStub);
          participants.meta = {
            customFilters: ['COMMON_DIVISION'],
          };
        });

        test('it should not display custom filters', async function (assert) {
          // given

          const customFiltersValues = { COMMON_DIVISION: 'Troisième' };
          // when
          const screen = await render(
            <template>
              <List
                @participants={{participants}}
                @triggerFiltering={{noop}}
                @onClickLearner={{noop}}
                @fullName={{fullNameFilter}}
                @customFiltersValues={{customFiltersValues}}
                @certificabilityFilter={{certificabilityFilter}}
              />
            </template>,
          );

          // then
          assert.notOk(screen.queryByLabelText(t('common.import.field.division')));
        });
      });
    });
  });

  module('when user is sorting the table', function () {
    module('sort by participation count', function () {
      test('it should trigger ascending sort on participation count column', async function (assert) {
        // given
        const participationCountOrder = null;

        const sortByParticipationCount = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @participationCountOrder={{participationCountOrder}}
              @sortByParticipationCount={{sortByParticipationCount}}
            />
          </template>,
        );

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.organization-participants.table.column.participation-count.ariaLabelDefaultSort'),
          }),
        );

        // then
        assert.ok(sortByParticipationCount.called);
      });
    });

    module('sort by lastname', function () {
      test('it should trigger ascending sort on lastname column', async function (assert) {
        // given

        const lastnameSort = null;

        const sortByLastname = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onFilter={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @lastnameSort={{lastnameSort}}
              @sortByLastname={{sortByLastname}}
            />
          </template>,
        );

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.organization-participants.table.column.last-name.ariaLabelDefaultSort'),
          }),
        );

        // then
        assert.ok(sortByLastname.called);
      });
    });

    module('sort by latestParticipation', function () {
      test('it should trigger ascending sort on latestParticipation column', async function (assert) {
        // given

        const latestParticipationOrder = null;

        const sortByLatestParticipation = sinon.spy();

        const participants = [
          {
            lastName: 'La Terreur',
            firstName: 'Gigi',
          },
        ];

        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onFilter={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @latestParticipationOrder={{latestParticipationOrder}}
              @sortByLatestParticipation={{sortByLatestParticipation}}
            />
          </template>,
        );

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.organization-participants.table.column.latest-participation.ariaLabelDefaultSort'),
          }),
        );

        // then
        assert.ok(sortByLatestParticipation.called);
      });
    });
  });

  test('it should display the empty state when no participants', async function (assert) {
    // given
    const participants = [];

    const certificabilityFilter = [];

    // when
    const screen = await render(
      <template>
        <List
          @participants={{participants}}
          @triggerFiltering={{noop}}
          @onClickLearner={{noop}}
          @fullName={{fullNameFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByText(t('pages.organization-participants.table.empty')));
  });

  test('it should display the certificability tooltip', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        isCertifiable: true,
      },
    ];

    const certificabilityFilter = [];

    // when
    const screen = await render(
      <template>
        <List
          @participants={{participants}}
          @triggerFiltering={{noop}}
          @onClickLearner={{noop}}
          @fullName={{fullNameFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByLabelText(t('components.certificability-tooltip.aria-label')));
    assert.ok(screen.getByText(t('components.certificability-tooltip.content')));
  });

  module('when user is admin of organisation', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should display checkboxes', async function (assert) {
      //given
      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];
      const deleteParticipants = sinon.stub();
      const customFiltersValues = null;
      //when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
            @deleteParticipants={{deleteParticipants}}
            @customFiltersValues={{customFiltersValues}}
          />
        </template>,
      );

      const mainCheckbox = screen.getByRole('checkbox', {
        name: t('pages.organization-participants.table.column.mainCheckbox'),
      });
      const learnerCheckbox = screen.getByRole('checkbox', {
        name: t('pages.organization-participants.table.column.checkbox', {
          firstname: participants[0].firstName,
          lastname: participants[0].lastName,
        }),
      });

      //then
      assert.ok(mainCheckbox);
      assert.ok(learnerCheckbox);
    });

    test('it should disable the main checkbox when participants list is empty', async function (assert) {
      //given
      const participants = [];

      const deleteParticipants = sinon.stub();
      //when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @certificabilityFilter={{certificabilityFilter}}
            @fullName={{fullNameFilter}}
            @deleteParticipants={{deleteParticipants}}
          />
        </template>,
      );
      //then
      assert
        .dom(
          screen.getByRole('checkbox', {
            name: t('pages.organization-participants.table.column.mainCheckbox'),
          }),
        )
        .isDisabled();
    });

    test('it should reset selected participants when using pagination', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const participants = [
        { id: '1', firstName: 'Spider', lastName: 'Man' },
        { id: '2', firstName: 'Captain', lastName: 'America' },
      ];

      participants.meta = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };

      // when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];
      const secondLearnerSelected = screen.getAllByRole('checkbox')[2];

      await click(firstLearnerSelected);
      await click(secondLearnerSelected);

      const nextButton = await screen.findByRole('button', { name: 'Aller à la page suivante', exact: false });

      await click(nextButton);
      assert.false(firstLearnerSelected.checked);
      assert.false(secondLearnerSelected.checked);
    });

    test('it should reset selected participant when using filters', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];

      participants.meta = { page: 1, pageSize: 10, rowCount: 50, pageCount: 5 };

      // when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];

      await click(firstLearnerSelected);

      await fillByLabel('Recherche sur le nom et prénom', 'Something');

      assert.false(firstLearnerSelected.checked);
    });

    test('it should reset selected participant when reset filters', async function (assert) {
      // given
      const resetFilter = sinon.spy();
      const participants = [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
        },
      ];

      const fullNameFilter = 'La Terreur';

      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @onResetFilter={{resetFilter}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];

      await click(firstLearnerSelected);

      // when
      const resetButton = await screen.findByRole('button', {
        name: t('common.filters.actions.clear'),
      });
      await click(resetButton);

      // then
      assert.false(firstLearnerSelected.checked);
    });

    test('it should reset selected participant when using sort', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];

      participants.meta = { page: 1, pageSize: 10, rowCount: 50, pageCount: 5 };

      // when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @sortByParticipationCount={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];

      await click(firstLearnerSelected);

      const sortButton = await screen.getByRole('button', {
        name: t('pages.organization-participants.table.column.participation-count.ariaLabelDefaultSort'),
      });
      await click(sortButton);

      assert.false(firstLearnerSelected.checked);
    });

    module('action bar', function () {
      test('it display action bar', async function (assert) {
        //given
        const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];

        const deleteParticipants = sinon.stub();

        //when
        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @deleteParticipants={{deleteParticipants}}
            />
          </template>,
        );

        const firstLearnerToDelete = screen.getAllByRole('checkbox')[1];
        await click(firstLearnerToDelete);

        //then
        assert.ok(screen.getByText(t('pages.organization-participants.action-bar.information', { count: 1 })));
      });

      test('it should open the deletion modal', async function (assert) {
        //given
        const spiderLearner = { id: '1', firstName: 'Spider', lastName: 'Man' };
        const peterLearner = { id: '2', firstName: 'Peter', lastName: 'Parker' };
        const milesLearner = { id: '3', firstName: 'Miles', lastName: 'Morales' };
        const participants = [spiderLearner, peterLearner, milesLearner];

        const deleteParticipants = sinon.stub();

        //when
        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @deleteParticipants={{deleteParticipants}}
            />
          </template>,
        );

        const firstLearnerToDelete = screen.getAllByRole('checkbox')[2];
        const secondLearnerToDelete = screen.getAllByRole('checkbox')[3];

        await click(firstLearnerToDelete);
        await click(secondLearnerToDelete);

        const deleteButton = await screen.findByRole('button', {
          name: t('pages.organization-participants.action-bar.delete-button'),
        });

        await click(deleteButton);

        await screen.findByRole('dialog');

        const confirmationButton = await screen.findByRole('button', {
          name: t('components.ui.deletion-modal.confirm-deletion'),
        });

        //then
        assert.ok(confirmationButton);
      });

      test('it should delete participants', async function (assert) {
        //given
        const spiderLearner = { id: '1', firstName: 'Spider', lastName: 'Man' };
        const peterLearner = { id: '2', firstName: 'Peter', lastName: 'Parker' };
        const milesLearner = { id: '3', firstName: 'Miles', lastName: 'Morales' };
        const participants = [spiderLearner, peterLearner, milesLearner];

        const deleteParticipants = sinon.stub();

        //when
        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @deleteParticipants={{deleteParticipants}}
            />
          </template>,
        );

        const firstLearnerToDelete = screen.getAllByRole('checkbox')[2];
        const secondLearnerToDelete = screen.getAllByRole('checkbox')[3];

        await click(firstLearnerToDelete);
        await click(secondLearnerToDelete);

        const deleteButton = await screen.findByRole('button', {
          name: t('pages.organization-participants.action-bar.delete-button'),
        });

        await click(deleteButton);

        await screen.findByRole('dialog');

        const allowMultipleDeletionCheckbox = await screen.findByRole('checkbox', {
          name: t('components.ui.deletion-modal.confirmation-checkbox', { count: 2 }),
        });

        await click(allowMultipleDeletionCheckbox);

        const confirmationButton = await screen.findByRole('button', {
          name: t('components.ui.deletion-modal.confirm-deletion'),
        });
        await click(confirmationButton);

        //then
        sinon.assert.calledWith(deleteParticipants, [peterLearner, milesLearner]);
        assert.ok(true);
      });

      test('it should reset selected participants after deletion', async function (assert) {
        //given
        const spiderLearner = { id: '1', firstName: 'Spider', lastName: 'Man' };
        const peterLearner = { id: '2', firstName: 'Peter', lastName: 'Parker' };
        const milesLearner = { id: '3', firstName: 'Miles', lastName: 'Morales' };
        const participants = [spiderLearner, peterLearner, milesLearner];

        const deleteParticipants = sinon.stub();

        //when
        const screen = await render(
          <template>
            <List
              @participants={{participants}}
              @triggerFiltering={{noop}}
              @onClickLearner={{noop}}
              @fullName={{fullNameFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @deleteParticipants={{deleteParticipants}}
            />
          </template>,
        );
        const mainCheckbox = screen.getAllByRole('checkbox')[0];
        const firstLearnerToDelete = screen.getAllByRole('checkbox')[2];
        const secondLearnerToDelete = screen.getAllByRole('checkbox')[3];

        await click(firstLearnerToDelete);
        await click(secondLearnerToDelete);

        const deleteButton = await screen.findByRole('button', {
          name: t('pages.organization-participants.action-bar.delete-button'),
        });

        await click(deleteButton);

        const allowMultipleDeletionCheckbox = await screen.findByRole('checkbox', {
          name: t('components.ui.deletion-modal.confirmation-checkbox', { count: 2 }),
        });

        await click(allowMultipleDeletionCheckbox);

        const confirmationButton = await screen.findByRole('button', {
          name: t('components.ui.deletion-modal.confirm-deletion'),
        });
        await click(confirmationButton);

        //then
        assert.false(mainCheckbox.checked);
      });
    });
  });

  module('edit modal functionality', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        canEditLearnerName = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should display dropdown actions when user can edit learner name', async function (assert) {
      // given
      const participants = [
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          extraColumns: {},
        },
      ];

      // when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('button', { name: t('pages.sup-organization-participants.actions.show-actions') }));
    });

    test('it should open edit modal when clicking edit action', async function (assert) {
      // given
      const participants = [
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          extraColumns: {},
        },
      ];

      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // when
      const dropdownButton = screen.getByRole('button', {
        name: t('pages.sup-organization-participants.actions.show-actions'),
      });
      await click(dropdownButton);

      const editButton = screen.getByText(t('components.ui.edit-participant-name-modal.label'));
      await click(editButton);

      // then
      assert.ok(screen.getByDisplayValue('Jean'));
      assert.ok(screen.getByDisplayValue('Dupont'));
    });

    test('it should close edit modal when clicking close', async function (assert) {
      // given
      const participants = [
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          extraColumns: {},
        },
      ];

      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      const dropdownButton = screen.getByRole('button', {
        name: t('pages.sup-organization-participants.actions.show-actions'),
      });
      await click(dropdownButton);

      const editButton = screen.getByText(t('components.ui.edit-participant-name-modal.label'));
      await click(editButton);

      // when
      const closeButton = screen.getByRole('button', {
        name: t('common.actions.close'),
      });
      await click(closeButton);

      // thenm
      assert.notOk(screen.queryByDisplayValue('Jean'));
      assert.notOk(screen.queryByDisplayValue('Dupont'));
    });

    test('it should not display dropdown actions when user cannot edit learner name', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        canEditLearnerName = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const participants = [
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          extraColumns: {},
        },
      ];

      // when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByLabelText(t('pages.sup-organization-participants.actions.show-actions')));
    });
  });

  module('hide checkbox context', function () {
    test('when user is not admin of organisation', async function (assert) {
      //given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];

      //when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );
      const checkboxes = screen.queryAllByRole('checkbox');

      //then
      assert.deepEqual(checkboxes.length, 0);
    });

    test('when feature import is enabled of organisation', async function (assert) {
      //given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        hasLearnerImportFeature = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const participants = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];

      //when
      const screen = await render(
        <template>
          <List
            @participants={{participants}}
            @triggerFiltering={{noop}}
            @onClickLearner={{noop}}
            @fullName={{fullNameFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );
      const checkboxes = screen.queryAllByRole('checkbox');

      //then
      assert.deepEqual(checkboxes.length, 0);
    });
  });
});
/* eslint-enable ember/template-no-let-reference */
