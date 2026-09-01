import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import SupOrganizationParticipantList from 'pix-orga/components/sup-organization-participant/list';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | SupOrganizationParticipant::List', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    const group = store.createRecord('group', { name: 'L1' });
    const organization = store.createRecord('organization', { groups: [group] });
    this.noop = sinon.stub();

    class CurrentUserStub extends Service {
      organization = organization;
    }

    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it should display the header labels', async function (assert) {
    // given
    const students = [];
    const certificabilityFilter = [];
    const groupFilter = [];
    const searchFilter = null;
    const studentNumberFilter = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <SupOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @onClickLearner={{noop}}
          @searchFilter={{searchFilter}}
          @groupsFilter={{groupFilter}}
          @studentNumberFilter={{studentNumberFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );

    // then
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sup-organization-participants.table.column.student-number'),
      }),
    );
    assert.ok(
      screen.getByRole('columnheader', {
        name: new RegExp('\\b' + t('pages.sup-organization-participants.table.column.last-name.label') + '\\b'),
      }),
    );
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sup-organization-participants.table.column.first-name'),
      }),
    );
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sup-organization-participants.table.column.date-of-birth'),
      }),
    );
    assert.ok(screen.getByRole('columnheader', { name: t('pages.sup-organization-participants.table.column.group') }));
    assert.ok(screen.getByRole('columnheader', { name: t('common.actions.global') }));
  });

  test('it should display a list of students', async function (assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: "L'asticot", firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];
    const certificabilityFilter = [];
    const groupFilter = [];
    const searchFilter = null;
    const studentNumberFilter = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <SupOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @onClickLearner={{noop}}
          @searchFilter={{searchFilter}}
          @groupsFilter={{groupFilter}}
          @studentNumberFilter={{studentNumberFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );

    // then
    assert.strictEqual(screen.getAllByRole('row').length, 3);
  });

  test('it should display a link to access student detail', async function (assert) {
    // given
    const students = [
      {
        lastName: 'Skywalker',
        firstName: 'Anakin',
        id: 66,
        birthdate: new Date('1977-05-25'),
      },
      {
        lastName: 'Kenobi',
        firstName: 'Obiwan',
        id: 33,
        birthdate: new Date('1977-05-25'),
      },
    ];
    const certificabilityFilter = [];
    const groupFilter = [];
    const searchFilter = null;
    const studentNumberFilter = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <SupOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @onClickLearner={{noop}}
          @searchFilter={{searchFilter}}
          @groupsFilter={{groupFilter}}
          @studentNumberFilter={{studentNumberFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );
    // then
    assert.ok(screen.getByRole('link', { name: 'Kenobi', href: /\/etudiants\/33/g }));
  });

  test('it should display the student number, firstName, lastName, birthdate, group, participation count and and last participation date of student', async function (assert) {
    // given
    const students = [
      {
        studentNumber: 'LATERREURGIGI123',
        lastName: 'La Terreur',
        firstName: 'Gigi',
        birthdate: new Date('2010-02-01'),
        group: 'AB1',
        participationCount: 88,
        lastParticipationDate: new Date('2022-01-03'),
      },
    ];
    const certificabilityFilter = [];
    const groupFilter = [];
    const searchFilter = null;
    const studentNumberFilter = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <SupOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @onClickLearner={{noop}}
          @searchFilter={{searchFilter}}
          @groupsFilter={{groupFilter}}
          @studentNumberFilter={{studentNumberFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByRole('cell', { name: 'LATERREURGIGI123' }));
    assert.ok(screen.getByRole('cell', { name: 'La Terreur' }));
    assert.ok(screen.getByRole('cell', { name: 'Gigi' }));
    assert.ok(screen.getByRole('cell', { name: '01/02/2010' }));
    assert.ok(screen.getByRole('cell', { name: 'AB1' }));
    assert.ok(screen.getByRole('cell', { name: '88' }));
    assert.ok(screen.getByRole('cell', { name: '03/01/2022' }));
  });

  test('it should display campaign name, type and status as tooltip information', async function (assert) {
    // given
    const students = [
      {
        lastParticipationDate: new Date('2022-01-03'),
        campaignName: 'SUP - Campagne de collecte de profils',
        campaignType: 'PROFILES_COLLECTION',
        participationStatus: 'SHARED',
      },
    ];
    const certificabilityFilter = [];
    const groupFilter = [];
    const searchFilter = null;
    const studentNumberFilter = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <SupOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @onClickLearner={{noop}}
          @searchFilter={{searchFilter}}
          @groupsFilter={{groupFilter}}
          @studentNumberFilter={{studentNumberFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByLabelText(t('pages.participants-list.latest-participation-information-tooltip.aria-label')));
    assert.ok(
      screen.getByText(
        t('pages.participants-list.latest-participation-information-tooltip.campaign-PROFILES_COLLECTION-type'),
      ),
    );
    assert.ok(
      screen.getByText(
        t('pages.participants-list.latest-participation-information-tooltip.participation-SHARED-status'),
      ),
    );
  });

  test('it should display participant as eligible for certification and since when if the sup participant is certifiable', async function (assert) {
    // given
    const students = [
      {
        lastParticipationDate: new Date('2022-01-03'),
        campaignName: 'SUP - Campagne de collecte de profils',
        campaignType: 'PROFILES_COLLECTION',
        participationStatus: 'SHARED',
        isCertifiable: true,
        certifiableAt: new Date('2024-04-26'),
      },
    ];
    const certificabilityFilter = [];
    const groupFilter = [];
    const searchFilter = null;
    const studentNumberFilter = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <SupOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @onClickLearner={{noop}}
          @searchFilter={{searchFilter}}
          @groupsFilter={{groupFilter}}
          @studentNumberFilter={{studentNumberFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );

    // then
    assert.ok(
      screen.getByRole('cell', {
        name: `${t('pages.sco-organization-participants.table.column.is-certifiable.eligible')} 26/04/2024`,
      }),
    );
  });

  test('it should display the certificability tooltip', async function (assert) {
    // given
    const students = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        isCertifiable: true,
      },
    ];
    const certificabilityFilter = [];
    const groupFilter = [];
    const searchFilter = null;
    const studentNumberFilter = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <SupOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @onClickLearner={{noop}}
          @searchFilter={{searchFilter}}
          @groupsFilter={{groupFilter}}
          @studentNumberFilter={{studentNumberFilter}}
          @certificabilityFilter={{certificabilityFilter}}
        />
      </template>,
    );

    // then
    await click(screen.getByLabelText(t('components.certificability-tooltip.aria-label')));

    // then
    assert.ok(screen.getByText(t('components.certificability-tooltip.content')));
  });

  module('when user is filtering some users', function () {
    test('it should trigger filtering with search', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      const students = [];
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      // when
      await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @onFilter={{triggerFiltering}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // when
      await fillByLabel(t('common.filters.fullname.label'), 'Bob M');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'search', 'Bob M');
      assert.ok(true);
    });

    test('it should trigger filtering with student number', async function (assert) {
      const triggerFiltering = sinon.spy();
      const students = [];
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      // when
      await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @onFilter={{triggerFiltering}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      await fillByLabel('Entrer un numéro étudiant', 'LATERREURGIGI123');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'studentNumber', 'LATERREURGIGI123');
      assert.ok(true);
    });

    test('it should trigger filtering with group', async function (assert) {
      const triggerFiltering = sinon.spy();
      const students = [];
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @onFilter={{triggerFiltering}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      const select = await screen.getByRole('button', {
        name: t('pages.sup-organization-participants.filter.group.label'),
      });
      await click(select);

      await screen.findByRole('menu');

      await clickByName('L1');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'groups', ['L1']);
      assert.ok(true);
    });

    test('it should trigger filtering with certificability', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      const students = [];
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @onFilter={{triggerFiltering}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // when
      const select = await screen.getByLabelText('Rechercher par certificabilité');
      await click(select);

      await screen.findByRole('menu');

      await clickByName('Certifiable');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'certificability', ['eligible']);
      assert.ok(true);
    });
  });

  module('when user is sorting the table', function () {
    test('it should trigger ascending sort on participation count column', async function (assert) {
      // given
      const participationCountOrder = null;
      const sortByParticipationCount = sinon.spy();
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{undefined}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
            @participationCountOrder={{participationCountOrder}}
            @sortByParticipationCount={{sortByParticipationCount}}
          />
        </template>,
      );

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.sup-organization-participants.table.column.participation-count.ariaLabelDefaultSort'),
        }),
      );

      // then
      assert.ok(sortByParticipationCount.called);
    });

    test('it should trigger ascending sort on lastname column', async function (assert) {
      // given
      const lastnameSort = null;
      const sortByLastname = sinon.spy();
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{undefined}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
            @lastnameSort={{lastnameSort}}
            @sortByLastname={{sortByLastname}}
          />
        </template>,
      );

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.sup-organization-participants.table.column.last-name.ariaLabelDefaultSort'),
        }),
      );

      // then
      assert.ok(sortByLastname.called);
    });

    test('it should trigger ascending sort on latest participation column', async function (assert) {
      // given
      const latestParticipationSort = null;
      const sortByLatestParticipation = sinon.spy();
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{undefined}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
            @latestParticipationSort={{latestParticipationSort}}
            @sortByLatestParticipation={{sortByLatestParticipation}}
          />
        </template>,
      );

      // when
      await click(
        screen.getByRole('button', {
          name: t('pages.sup-organization-participants.table.column.last-participation-date.ariaLabelDefaultSort'),
        }),
      );

      // then
      assert.ok(sortByLatestParticipation.called);
    });
  });

  module('when filter result does not match current participant information', function () {
    test('it should display a no student message', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 1 };
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.sup-organization-participants.table.empty')));
    });
  });

  module('when there is no participants in the organization', function () {
    test('it should display an import students message', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 0 };
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.sup-organization-participants.empty-state.no-participants-action')));
    });
  });

  module('when user is admin of organisation', function (hooks) {
    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', { groups: [] });

      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        organization = organization;
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should display checkboxes', async function (assert) {
      // given
      const students = [{ id: '1', firstName: 'Spider', lastName: 'Man', group: 'A1' }];
      students.meta = { participantCount: students.length };
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      assert.ok(
        screen.getByRole('checkbox', {
          name: t('pages.organization-participants.table.column.mainCheckbox'),
        }),
      );

      assert.ok(
        screen.getByRole('checkbox', {
          name: t('pages.organization-participants.table.column.checkbox', {
            firstname: students[0].firstName,
            lastname: students[0].lastName,
          }),
        }),
      );
    });

    test('it should disable the main checkbox when participants list is empty', async function (assert) {
      //given
      const students = [];
      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      //when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      //then
      assert.ok(
        screen
          .getByRole('checkbox', {
            name: t('pages.organization-participants.table.column.mainCheckbox'),
          })
          .hasAttribute('disabled'),
      );
    });

    test('it should reset selected participants when using pagination', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const students = [
        { id: '1', firstName: 'Spider', lastName: 'Man' },
        { id: '2', firstName: 'Captain', lastName: 'America' },
      ];

      students.meta = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };

      const searchFilter = null;
      const studentNumberFilter = null;
      const groupsFilter = [];
      const certificabilityFilter = [];
      const participationCountOrder = null;
      const lastnameSort = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @searchFilter={{searchFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @groupsFilter={{groupsFilter}}
            @certificabilityFilter={{certificabilityFilter}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
            @participationCountOrder={{participationCountOrder}}
            @sortByParticipationCount={{noop}}
            @sortByLastname={{noop}}
            @lastnameSort={{lastnameSort}}
          />
        </template>,
      );

      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];
      const secondLearnerSelected = screen.getAllByRole('checkbox')[2];

      await click(firstLearnerSelected);
      await click(secondLearnerSelected);

      const nextButton = await screen.findByRole('button', { name: 'Aller à la page suivante', exact: false });

      await click(nextButton);
      // then
      assert.false(firstLearnerSelected.checked);
      assert.false(secondLearnerSelected.checked);
    });

    test('it should reset selected participant when using filters', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const students = [
        { id: '1', firstName: 'Spider', lastName: 'Man' },
        { id: '2', firstName: 'Captain', lastName: 'America' },
      ];

      students.meta = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };

      const searchFilter = null;
      const studentNumberFilter = null;
      const groupsFilter = [];
      const certificabilityFilter = [];
      const participationCountOrder = null;
      const lastnameSort = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @searchFilter={{searchFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @groupsFilter={{groupsFilter}}
            @certificabilityFilter={{certificabilityFilter}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
            @participationCountOrder={{participationCountOrder}}
            @sortByParticipationCount={{noop}}
            @sortByLastname={{noop}}
            @lastnameSort={{lastnameSort}}
          />
        </template>,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];

      await click(firstLearnerSelected);

      await fillByLabel(t('common.filters.fullname.label'), 'Something');

      // then
      assert.false(firstLearnerSelected.checked);
    });

    test('it should reset selected participant when reset filters', async function (assert) {
      // given
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');

      const students = [
        { id: '1', firstName: 'Spider', lastName: 'Man' },
        { id: '2', firstName: 'Captain', lastName: 'America' },
      ];

      students.meta = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };

      const searchFilter = null;
      const studentNumberFilter = null;
      const groupsFilter = ['a1'];
      const certificabilityFilter = [];
      const participationCountOrder = null;
      const lastnameSort = null;
      const noop = this.noop;

      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @searchFilter={{searchFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @groupsFilter={{groupsFilter}}
            @certificabilityFilter={{certificabilityFilter}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
            @participationCountOrder={{participationCountOrder}}
            @sortByParticipationCount={{noop}}
            @sortByLastname={{noop}}
            @lastnameSort={{lastnameSort}}
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

      const students = [
        { id: '1', firstName: 'Spider', lastName: 'Man' },
        { id: '2', firstName: 'Captain', lastName: 'America' },
      ];

      students.meta = { page: 1, pageSize: 1, rowCount: 2, pageCount: 2 };

      const searchFilter = null;
      const studentNumberFilter = null;
      const groupsFilter = [];
      const certificabilityFilter = [];
      const participationCountOrder = null;
      const lastnameSort = null;
      const noop = this.noop;

      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @searchFilter={{searchFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @groupsFilter={{groupsFilter}}
            @certificabilityFilter={{certificabilityFilter}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
            @participationCountOrder={{participationCountOrder}}
            @sortByParticipationCount={{noop}}
            @sortByLastname={{noop}}
            @lastnameSort={{lastnameSort}}
          />
        </template>,
      );
      const firstLearnerSelected = screen.getAllByRole('checkbox')[1];
      await click(firstLearnerSelected);

      // when
      const sortButton = await screen.getByRole('button', {
        name: t('pages.organization-participants.table.column.participation-count.ariaLabelDefaultSort'),
      });
      await click(sortButton);

      assert.false(firstLearnerSelected.checked);
    });

    module('action bar', function () {
      test('it display action bar', async function (assert) {
        //given
        const students = [
          { id: '1', firstName: 'Spider', lastName: 'Man' },
          { id: '2', firstName: 'Captain', lastName: 'America' },
        ];

        students.meta = { page: 1, pageSize: 2, rowCount: 2, pageCount: 1 };

        const searchFilter = null;
        const studentNumberFilter = null;
        const groupsFilter = [];
        const certificabilityFilter = [];
        const participationCountOrder = null;
        const lastnameSort = null;
        const deleteStudents = sinon.stub();
        const noop = this.noop;

        // when
        const screen = await render(
          <template>
            <SupOrganizationParticipantList
              @students={{students}}
              @searchFilter={{searchFilter}}
              @studentNumberFilter={{studentNumberFilter}}
              @groupsFilter={{groupsFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @onFilter={{noop}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
              @participationCountOrder={{participationCountOrder}}
              @sortByParticipationCount={{noop}}
              @sortByLastname={{noop}}
              @lastnameSort={{lastnameSort}}
              @deleteStudents={{deleteStudents}}
            />
          </template>,
        );

        const firstLearnerToDelete = screen.getAllByRole('checkbox')[1];
        await click(firstLearnerToDelete);

        //then
        assert.ok(screen.getByText(t('pages.sup-organization-participants.action-bar.information', { count: 1 })));
      });

      test('it should open the deletion modale', async function (assert) {
        //given
        const spiderLearner = { id: '1', firstName: 'Spider', lastName: 'Man' };
        const peterLearner = { id: '2', firstName: 'Peter', lastName: 'Parker' };
        const milesLearner = { id: '3', firstName: 'Miles', lastName: 'Morales' };
        const students = [spiderLearner, peterLearner, milesLearner];

        students.meta = { page: 1, pageSize: 3, rowCount: 3, pageCount: 1 };

        const searchFilter = null;
        const studentNumberFilter = null;
        const groupsFilter = [];
        const certificabilityFilter = [];
        const participationCountOrder = null;
        const lastnameSort = null;
        const deleteStudents = sinon.stub();
        const noop = this.noop;

        // when
        const screen = await render(
          <template>
            <SupOrganizationParticipantList
              @students={{students}}
              @searchFilter={{searchFilter}}
              @studentNumberFilter={{studentNumberFilter}}
              @groupsFilter={{groupsFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @onFilter={{noop}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
              @participationCountOrder={{participationCountOrder}}
              @sortByParticipationCount={{noop}}
              @sortByLastname={{noop}}
              @lastnameSort={{lastnameSort}}
              @deleteStudents={{deleteStudents}}
            />
          </template>,
        );

        const firstLearnerToDelete = screen.getAllByRole('checkbox')[2];
        const secondLearnerToDelete = screen.getAllByRole('checkbox')[3];

        await click(firstLearnerToDelete);
        await click(secondLearnerToDelete);

        const deleteButton = await screen.findByRole('button', {
          name: t('pages.sup-organization-participants.action-bar.delete-button'),
        });

        await click(deleteButton);

        await screen.findByRole('dialog');

        const confirmationButton = await screen.findByRole('button', {
          name: t('components.ui.deletion-modal.confirm-deletion'),
        });

        //then
        assert.ok(confirmationButton);
      });

      test('it should delete students', async function (assert) {
        //given
        const spiderLearner = { id: '1', firstName: 'Spider', lastName: 'Man' };
        const peterLearner = { id: '2', firstName: 'Peter', lastName: 'Parker' };
        const milesLearner = { id: '3', firstName: 'Miles', lastName: 'Morales' };
        const students = [spiderLearner, peterLearner, milesLearner];

        students.meta = { page: 1, pageSize: 3, rowCount: 3, pageCount: 1 };

        const searchFilter = null;
        const studentNumberFilter = null;
        const groupsFilter = [];
        const certificabilityFilter = [];
        const participationCountOrder = null;
        const lastnameSort = null;
        const deleteStudents = sinon.stub();
        const noop = this.noop;

        // when
        const screen = await render(
          <template>
            <SupOrganizationParticipantList
              @students={{students}}
              @searchFilter={{searchFilter}}
              @studentNumberFilter={{studentNumberFilter}}
              @groupsFilter={{groupsFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @onFilter={{noop}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
              @participationCountOrder={{participationCountOrder}}
              @sortByParticipationCount={{noop}}
              @sortByLastname={{noop}}
              @lastnameSort={{lastnameSort}}
              @deleteStudents={{deleteStudents}}
            />
          </template>,
        );

        const firstLearnerToDelete = screen.getAllByRole('checkbox')[2];
        const secondLearnerToDelete = screen.getAllByRole('checkbox')[3];

        await click(firstLearnerToDelete);
        await click(secondLearnerToDelete);

        const deleteButton = await screen.findByRole('button', {
          name: t('pages.sup-organization-participants.action-bar.delete-button'),
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
        sinon.assert.calledWith(deleteStudents, [peterLearner, milesLearner]);
        assert.ok(true);
      });

      test('it should reset selected participants after deletion', async function (assert) {
        //given
        const spiderLearner = { id: '1', firstName: 'Spider', lastName: 'Man' };
        const peterLearner = { id: '2', firstName: 'Peter', lastName: 'Parker' };
        const milesLearner = { id: '3', firstName: 'Miles', lastName: 'Morales' };
        const students = [spiderLearner, peterLearner, milesLearner];

        students.meta = { page: 1, pageSize: 3, rowCount: 3, pageCount: 1 };

        const searchFilter = null;
        const studentNumberFilter = null;
        const groupsFilter = [];
        const certificabilityFilter = [];
        const participationCountOrder = null;
        const lastnameSort = null;
        const deleteStudents = sinon.stub();
        const noop = this.noop;

        // when
        const screen = await render(
          <template>
            <SupOrganizationParticipantList
              @students={{students}}
              @searchFilter={{searchFilter}}
              @studentNumberFilter={{studentNumberFilter}}
              @groupsFilter={{groupsFilter}}
              @certificabilityFilter={{certificabilityFilter}}
              @onFilter={{noop}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
              @participationCountOrder={{participationCountOrder}}
              @sortByParticipationCount={{noop}}
              @sortByLastname={{noop}}
              @lastnameSort={{lastnameSort}}
              @deleteStudents={{deleteStudents}}
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

    module('edit modal functionality', function (hooks) {
      hooks.beforeEach(function () {
        class CurrentUserStub extends Service {
          canEditLearnerName = true;
          isAdminInOrganization = true;
          organization = store.createRecord('organization', {
            isManagingStudents: false,
            id: '1',
          });
        }
        this.owner.register('service:current-user', CurrentUserStub);
        this.divisions = [];
        this.connectionTypes = [];
        this.certificability = [];
        this.groupsFilter = [];
        this.search = null;
      });

      test('it should display dropdown actions when user can edit learner name', async function (assert) {
        // given
        const students = [
          store.createRecord('sco-organization-participant', {
            id: '1',
            firstName: 'Jean',
            lastName: 'Dupont',
            username: 'jean.dupont0101',
          }),
        ];
        const search = this.search;
        const groupsFilter = this.groupsFilter;
        const connectionTypes = this.connectionTypes;
        const certificability = this.certificability;
        const noop = this.noop;

        // when
        const screen = await render(
          <template>
            <SupOrganizationParticipantList
              @students={{students}}
              @onFilter={{noop}}
              @searchFilter={{search}}
              @groupsFilter={{groupsFilter}}
              @connectionTypeFilter={{connectionTypes}}
              @certificabilityFilter={{certificability}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByRole('button', { name: t('pages.sco-organization-participants.actions.show-actions') }));
      });

      test('it should open edit modal when clicking edit action', async function (assert) {
        // given
        const students = [
          store.createRecord('sco-organization-participant', {
            id: '1',
            firstName: 'Jean',
            lastName: 'Dupont',
            username: 'jean.dupont0101',
            isAuthenticatedFromGar: false,
          }),
        ];
        const search = this.search;
        const groupsFilter = this.groupsFilter;
        const connectionTypes = this.connectionTypes;
        const certificability = this.certificability;
        const noop = this.noop;

        const screen = await render(
          <template>
            <SupOrganizationParticipantList
              @students={{students}}
              @onFilter={{noop}}
              @searchFilter={{search}}
              @groupsFilter={{groupsFilter}}
              @connectionTypeFilter={{connectionTypes}}
              @certificabilityFilter={{certificability}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
              @refreshValues={{noop}}
            />
          </template>,
        );

        // when
        const dropdownButton = screen.getByRole('button', {
          name: t('pages.sco-organization-participants.actions.show-actions'),
        });
        await click(dropdownButton);
        const editButton = screen.getByRole('button', { name: t('components.ui.edit-participant-name-modal.label') });

        // then
        assert.ok(editButton);
        assert.dom(editButton).isNotDisabled();
      });

      test('it should not display dropdown actions when user cannot edit learner name', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = {};
          canEditLearnerName = false;
          organization = store.createRecord('organization', {
            id: '1',
            divisions: [store.createRecord('division', { id: '3F', name: '3F' })],
          });
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const students = [
          store.createRecord('sco-organization-participant', {
            id: '1',
            firstName: 'Jean',
            lastName: 'Dupont',
            isAuthenticatedFromGar: false,
          }),
        ];
        const search = this.search;
        const groupsFilter = this.groupsFilter;
        const connectionTypes = this.connectionTypes;
        const certificability = this.certificability;
        const noop = this.noop;

        // when
        const screen = await render(
          <template>
            <SupOrganizationParticipantList
              @students={{students}}
              @onFilter={{noop}}
              @searchFilter={{search}}
              @groupsFilter={{groupsFilter}}
              @connectionTypeFilter={{connectionTypes}}
              @certificabilityFilter={{certificability}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
            />
          </template>,
        );

        // then
        assert.notOk(
          screen.queryByRole('button', { name: t('pages.sco-organization-participants.actions.show-actions') }),
        );
      });
    });
  });

  module('when user is not admin of organisation', function () {
    test('it should not display checkboxes', async function (assert) {
      //given
      const orgStore = this.owner.lookup('service:store');
      const organization = orgStore.createRecord('organization', { groups: [] });
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        organization = organization;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const students = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];
      students.meta = { participantCount: 0 };

      const certificabilityFilter = [];
      const groupFilter = [];
      const searchFilter = null;
      const studentNumberFilter = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <SupOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @onClickLearner={{noop}}
            @searchFilter={{searchFilter}}
            @groupsFilter={{groupFilter}}
            @studentNumberFilter={{studentNumberFilter}}
            @certificabilityFilter={{certificabilityFilter}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByLabelText(t('pages.organization-participants.table.column.mainCheckbox')));

      assert.notOk(
        screen.queryByLabelText(
          t('pages.organization-participants.table.column.checkbox', {
            firstname: students[0].firstName,
            lastname: students[0].lastName,
          }),
        ),
      );
    });
  });
});
