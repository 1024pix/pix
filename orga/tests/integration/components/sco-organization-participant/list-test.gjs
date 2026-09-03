import { clickByName, fillByLabel, render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ScoOrganizationParticipantList from 'pix-orga/components/sco-organization-participant/list';
import { module, test } from 'qunit';
import sinon from 'sinon';
import striptags from 'striptags';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::List', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    this.noop = sinon.stub();

    store = this.owner.lookup('service:store');

    const division = store.createRecord('division', { id: '3A', name: '3A' });

    class CurrentUserStub extends Service {
      prescriber = {};
      isSCOManagingStudents = true;
      organization = store.createRecord('organization', {
        id: '1',
        divisions: [division],
      });
    }

    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it should display columns headers', async function (assert) {
    // given
    const students = [];
    const divisions = [];
    const connectionTypes = [];
    const certificability = [];
    const search = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <ScoOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @searchFilter={{search}}
          @divisionsFilter={{divisions}}
          @connectionTypeFilter={{connectionTypes}}
          @certificabilityFilter={{certificability}}
          @onClickLearner={{noop}}
          @onResetFilter={{noop}}
          @hasComputeOrganizationLearnerCertificabilityEnabled={{true}}
        />
      </template>,
    );

    // then
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sco-organization-participants.table.column.last-name.label'),
      }),
    );
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sco-organization-participants.table.column.first-name'),
      }),
    );
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sco-organization-participants.table.column.date-of-birth'),
      }),
    );
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sco-organization-participants.table.column.login-method'),
      }),
    );
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sco-organization-participants.table.column.participation-count.label'),
      }),
    );
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sco-organization-participants.table.column.last-participation-date.label'),
      }),
    );
    assert.ok(
      screen.getByRole('columnheader', {
        name: t('pages.sco-organization-participants.table.column.is-certifiable.label'),
      }),
    );
    assert.ok(screen.getByRole('columnheader', { name: t('common.actions.global') }));
  });

  test('it should display a list of students', async function (assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: "L'asticot", firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];
    const divisions = [];
    const connectionTypes = [];
    const certificability = [];
    const search = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <ScoOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @searchFilter={{search}}
          @divisionsFilter={{divisions}}
          @connectionTypeFilter={{connectionTypes}}
          @certificabilityFilter={{certificability}}
          @onClickLearner={{noop}}
          @onResetFilter={{noop}}
          @hasComputeOrganizationLearnerCertificabilityEnabled={{true}}
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
        lastName: 'Michael',
        firstName: 'Jackson',
        id: 77,
        birthdate: new Date('2000-01-01'),
      },
      {
        lastName: 'Michel',
        firstName: 'Patrick',
        id: 22,
        birthdate: new Date('2011-11-11'),
      },
    ];
    const divisions = [];
    const connectionTypes = [];
    const certificability = [];
    const search = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <ScoOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @searchFilter={{search}}
          @divisionsFilter={{divisions}}
          @connectionTypeFilter={{connectionTypes}}
          @certificabilityFilter={{certificability}}
          @onClickLearner={{noop}}
          @onResetFilter={{noop}}
          @hasComputeOrganizationLearnerCertificabilityEnabled={{true}}
        />
      </template>,
    );
    // then
    assert.ok(screen.getByRole('link', { name: 'Michel', href: /\/eleves\/22/g }));
  });

  test('it should display the firstName, lastName, birthdate, division, participation count, last participation date of student, the last participation tooltip and certifiableAt', async function (assert) {
    // given
    const students = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        division: '3B',
        birthdate: new Date('2010-02-01'),
        participationCount: 42,
        lastParticipationDate: new Date('2022-01-03'),
        certifiableAt: new Date('2022-01-02'),
      },
    ];
    const divisions = [];
    const connectionTypes = [];
    const certificability = [];
    const search = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <ScoOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @searchFilter={{search}}
          @divisionsFilter={{divisions}}
          @connectionTypeFilter={{connectionTypes}}
          @certificabilityFilter={{certificability}}
          @onClickLearner={{noop}}
          @onResetFilter={{noop}}
          @hasComputeOrganizationLearnerCertificabilityEnabled={{true}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByRole('cell', { name: 'La Terreur' }), 'La terreur');
    assert.ok(screen.getByRole('cell', { name: 'Gigi' }), 'Gigi');
    assert.ok(screen.getByRole('cell', { name: '01/02/2010' }), '01/02/2010');
    assert.ok(screen.getByRole('cell', { name: '3B' }), '3B');
    assert.ok(screen.getByRole('cell', { name: '42' }), '42');
    assert.ok(screen.getByRole('cell', { name: '03/01/2022' }), '03/01/2022');
    assert.notOk(screen.queryByRole('cell', { name: '02/01/2022' }), '02/01/2022');
    assert.ok(
      screen.getByLabelText(t('pages.participants-list.latest-participation-information-tooltip.aria-label')),
      'tooltip-label',
    );
  });

  test('[A11Y] it should have a description for screen-readers', async function (assert) {
    // given
    const divisions = [];
    const connectionTypes = [];
    const certificability = [];
    const search = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <ScoOrganizationParticipantList
          @students={{undefined}}
          @onFilter={{noop}}
          @searchFilter={{search}}
          @divisionsFilter={{divisions}}
          @connectionTypeFilter={{connectionTypes}}
          @certificabilityFilter={{certificability}}
          @onClickLearner={{noop}}
          @onResetFilter={{noop}}
          @hasComputeOrganizationLearnerCertificabilityEnabled={{true}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByText(t('pages.sco-organization-participants.table.description')));
  });

  test('it should display participant as eligible for certification when the participant is certifiable', async function (assert) {
    // given
    const students = [
      store.createRecord('sco-organization-participant', {
        isCertifiable: true,
      }),
    ];
    const divisions = [];
    const connectionTypes = [];
    const certificability = [];
    const search = null;
    const noop = this.noop;

    // when
    const screen = await render(
      <template>
        <ScoOrganizationParticipantList
          @students={{students}}
          @onFilter={{noop}}
          @searchFilter={{search}}
          @divisionsFilter={{divisions}}
          @connectionTypeFilter={{connectionTypes}}
          @certificabilityFilter={{certificability}}
          @onClickLearner={{noop}}
          @onResetFilter={{noop}}
          @hasComputeOrganizationLearnerCertificabilityEnabled={{true}}
        />
      </template>,
    );

    // then
    assert.ok(
      screen.getByRole('cell', {
        name: t('pages.sco-organization-participants.table.column.is-certifiable.eligible'),
      }),
    );
  });

  module('filters', function () {
    module('connection types', function () {
      test('displays a list of options to filter the students', async function (assert) {
        // given
        const students = [];
        const divisions = [];
        const connectionTypes = [];
        const certificability = [];
        const search = null;
        const noop = this.noop;

        const screen = await render(
          <template>
            <ScoOrganizationParticipantList
              @students={{students}}
              @onFilter={{noop}}
              @searchFilter={{search}}
              @divisionsFilter={{divisions}}
              @connectionTypeFilter={{connectionTypes}}
              @certificabilityFilter={{certificability}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
            />
          </template>,
        );

        // when
        await click(screen.getByLabelText('Rechercher par méthode de connexion'));
        await screen.findByRole('menu');

        // then
        assert.ok(
          screen.getByRole('checkbox', {
            name: t('pages.sco-organization-participants.connection-types.none'),
          }),
        );
        assert.ok(
          screen.getByRole('checkbox', {
            name: t('pages.sco-organization-participants.connection-types.email'),
          }),
        );
        assert.ok(
          screen.getByRole('checkbox', {
            name: t('pages.sco-organization-participants.connection-types.identifiant'),
          }),
        );
        assert.ok(
          screen.getByRole('checkbox', {
            name: t('pages.sco-organization-participants.connection-types.mediacentre'),
          }),
        );
        assert.ok(
          screen.getByRole('checkbox', {
            name: t('pages.sco-organization-participants.connection-types.without-mediacentre'),
          }),
        );
      });
    });
  });

  module('when user is filtering some users', function () {
    test('it should trigger filtering with search', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      const students = [];
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{triggerFiltering}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );

      // when
      await fillByLabel(t('common.filters.fullname.label'), 'Bob M');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'search', 'Bob M');
      assert.ok(true);
    });

    test('it should trigger filtering with division', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      const students = [];
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{triggerFiltering}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );

      // when
      const select = await screen.getByRole('button', {
        name: t('pages.sco-organization-participants.filter.division.label'),
      });
      await click(select);

      await screen.findByRole('menu');

      await clickByName('3A');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'divisions', ['3A']);
      assert.ok(true);
    });

    test('it should trigger filtering with connectionType', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      const students = [];
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{triggerFiltering}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );

      // when
      await click(screen.getByLabelText('Rechercher par méthode de connexion'));
      await click(await screen.findByRole('checkbox', { name: 'Adresse e-mail' }));

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'connectionTypes', ['email']);
      assert.ok(true);
    });

    test('it should trigger filtering with certificability', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      const students = [];
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{triggerFiltering}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
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

    test('it should call resetFiltered', async function (assert) {
      // given
      const resetFiltered = sinon.spy();
      const triggerFiltering = sinon.spy();
      const noop = this.noop;

      store.createRecord('sco-organization-participant', {
        lastName: 'La Terreur',
        firstName: 'Gigi',
        birthdate: '2010-01-01',
      });
      const students = [];
      const divisions = ['4A'];
      const connectionTypes = [];
      const certificability = [];
      const search = null;

      await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{triggerFiltering}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{resetFiltered}}
          />
        </template>,
      );

      // when
      await clickByName('Effacer les filtres');

      // then
      sinon.assert.called(resetFiltered);
      assert.ok(true);
    });
  });

  module('when user is sorting the table', function () {
    module('Participant count column', function () {
      test('it should trigger ascending sort on participation count column', async function (assert) {
        // given
        const participationCountOrder = null;
        const sortByParticipationCount = sinon.spy();
        const divisions = [];
        const connectionTypes = [];
        const certificability = [];
        const search = null;
        const noop = this.noop;

        const screen = await render(
          <template>
            <ScoOrganizationParticipantList
              @students={{undefined}}
              @onFilter={{noop}}
              @searchFilter={{search}}
              @divisionsFilter={{divisions}}
              @connectionTypeFilter={{connectionTypes}}
              @certificabilityFilter={{certificability}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
              @participationCountOrder={{participationCountOrder}}
              @sortByParticipationCount={{sortByParticipationCount}}
            />
          </template>,
        );

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.sco-organization-participants.table.column.participation-count.ariaLabelDefaultSort'),
          }),
        );

        // then
        assert.ok(sortByParticipationCount.called);
      });
    });

    module('lastname column', function () {
      test('it should trigger ascending sort on lastname column', async function (assert) {
        // given
        const lastnameSort = null;
        const sortByLastname = sinon.spy();
        const divisions = [];
        const connectionTypes = [];
        const certificability = [];
        const search = null;
        const noop = this.noop;

        const screen = await render(
          <template>
            <ScoOrganizationParticipantList
              @students={{undefined}}
              @onFilter={{noop}}
              @searchFilter={{search}}
              @divisionsFilter={{divisions}}
              @connectionTypeFilter={{connectionTypes}}
              @certificabilityFilter={{certificability}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
              @lastnameSort={{lastnameSort}}
              @sortByLastname={{sortByLastname}}
            />
          </template>,
        );

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.sco-organization-participants.table.column.last-name.ariaLabelDefaultSort'),
          }),
        );

        // then
        assert.ok(sortByLastname.called);
      });
    });

    module('division column', function () {
      test('it should trigger ascending sort', async function (assert) {
        // given
        const divisionSort = null;
        const sortByDivision = sinon.spy();
        const divisions = [];
        const connectionTypes = [];
        const certificability = [];
        const search = null;
        const noop = this.noop;

        const screen = await render(
          <template>
            <ScoOrganizationParticipantList
              @students={{undefined}}
              @onFilter={{noop}}
              @searchFilter={{search}}
              @divisionsFilter={{divisions}}
              @connectionTypeFilter={{connectionTypes}}
              @certificabilityFilter={{certificability}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
              @divisionSort={{divisionSort}}
              @sortByDivision={{sortByDivision}}
            />
          </template>,
        );

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.sco-organization-participants.table.column.division.ariaLabelDefaultSort'),
          }),
        );

        // then
        assert.ok(sortByDivision.called);
      });
    });

    module('latest participation column', function () {
      test('it should trigger ascending sort', async function (assert) {
        // given
        const latestParticipationSort = null;
        const sortByLatestParticipation = sinon.spy();
        const divisions = [];
        const connectionTypes = [];
        const certificability = [];
        const search = null;
        const noop = this.noop;

        const screen = await render(
          <template>
            <ScoOrganizationParticipantList
              @students={{undefined}}
              @onFilter={{noop}}
              @searchFilter={{search}}
              @divisionsFilter={{divisions}}
              @connectionTypeFilter={{connectionTypes}}
              @certificabilityFilter={{certificability}}
              @onClickLearner={{noop}}
              @onResetFilter={{noop}}
              @latestParticipationSort={{latestParticipationSort}}
              @sortByLatestParticipation={{sortByLatestParticipation}}
            />
          </template>,
        );

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.sco-organization-participants.table.column.last-participation-date.ariaLabelDefaultSort'),
          }),
        );

        // then
        assert.ok(sortByLatestParticipation.called);
      });
    });
  });

  module('when user is not reconciled', function ({ beforeEach }) {
    let screen;
    beforeEach(async function () {
      store = this.owner.lookup('service:store');
      const students = [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
        }),
      ];
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );
    });

    test('it should display None for authentication method', async function (assert) {
      assert.ok(
        within(screen.getAllByRole('row')[1]).getByRole('cell', {
          name: t('pages.sco-organization-participants.connection-types.none'),
        }),
      );
    });

    test('it should not display actions menu for username', async function (assert) {
      assert.notOk(
        screen.queryByRole('button', { name: t('pages.sco-organization-participants.actions.show-actions') }),
      );
    });
  });

  module('when user is reconciled', function () {
    test('it should display the manage account entry menu', async function (assert) {
      // given
      const students = [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          username: 'blueivy.carter0701',
          isAuthenticatedFromGar: false,
        }),
      ];
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );

      // when
      await clickByName(t('pages.sco-organization-participants.actions.show-actions'));

      // then
      assert.ok(screen.getByRole('button', { name: t('pages.sco-organization-participants.actions.manage-account') }));
    });
  });

  module('when user authentification method is username', function ({ beforeEach }) {
    let screen;
    beforeEach(async function () {
      const students = [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          username: 'blueivy.carter0701',
          isAuthenticatedFromGar: false,
        }),
      ];
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );
    });

    test('it should display "Identifiant" as authentication method', async function (assert) {
      assert.ok(
        within(screen.getAllByRole('row')[1]).getByRole('cell', {
          name: t('pages.sco-organization-participants.connection-types.identifiant'),
        }),
      );
    });

    test('it should display actions menu', async function (assert) {
      assert.ok(screen.getByRole('button', { name: t('pages.sco-organization-participants.actions.show-actions') }));
    });
  });

  module('when user authentification method is email', function ({ beforeEach }) {
    let screen;
    beforeEach(async function () {
      const students = [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          email: 'firstname.lastname@example.net',
          isAuthenticatedFromGar: false,
        }),
      ];
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      // when
      screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );
    });

    test('it should display "Adresse email" as authentication method', function (assert) {
      assert.ok(
        within(screen.getAllByRole('row')[1]).getByRole('cell', {
          name: t('pages.sco-organization-participants.connection-types.email'),
        }),
      );
    });

    test('it should display actions menu for email', async function (assert) {
      assert.ok(screen.getByRole('button', { name: t('pages.sco-organization-participants.actions.show-actions') }));
    });
  });

  module('when user authentification method is samlId', function ({ beforeEach }) {
    beforeEach(function () {
      store = this.owner.lookup('service:store');
      this.students = [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          email: null,
          username: null,
          isAuthenticatedFromGar: true,
        }),
      ];
      this.divisions = [];
      this.connectionTypes = [];
      this.certificability = [];
      this.search = null;
    });

    test('it should display "Mediacentre" as authentication method', async function (assert) {
      // given
      const students = this.students;
      const divisions = this.divisions;
      const connectionTypes = this.connectionTypes;
      const certificability = this.certificability;
      const search = this.search;
      const noop = this.noop;

      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );

      // then
      assert.ok(
        within(screen.getAllByRole('row')[1]).getByRole('cell', {
          name: t('pages.sco-organization-participants.connection-types.mediacentre'),
        }),
      );
    });

    test('it should display the action menu', async function (assert) {
      // when
      const students = this.students;
      const divisions = this.divisions;
      const connectionTypes = this.connectionTypes;
      const certificability = this.certificability;
      const search = this.search;
      const noop = this.noop;

      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
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

    test('it should display the certificability tooltip', async function (assert) {
      // given
      const students = [
        store.createRecord('sco-organization-participant', {
          isCertifiable: true,
        }),
      ];
      const divisions = this.divisions;
      const connectionTypes = this.connectionTypes;
      const certificability = this.certificability;
      const search = this.search;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );

      await click(screen.getByLabelText(t('components.certificability-tooltip.aria-label')));

      // then
      assert.ok(screen.getByText(t('components.certificability-tooltip.content')));
    });
  });

  module('when there is participants but no results with filters', function () {
    test('it should display a message telling if there is no rows display', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 1 };
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.sco-organization-participants.table.empty')));
    });
  });

  module('when there is no participants in the organization', function () {
    test('it should display a message telling to use import', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 0 };
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];
      const search = null;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
            @onClickLearner={{noop}}
            @onResetFilter={{noop}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.sco-organization-participants.no-participants-action')));
    });
  });

  module('when organization has type "SCO" and manage students', function () {
    test('displays checkboxes', async function (assert) {
      // given
      const noop = sinon.stub();

      store = this.owner.lookup('service:store');

      const division = store.createRecord('division', { id: '3BF', name: '3BF' });
      class CurrentUserStub extends Service {
        prescriber = {};
        organization = store.createRecord('organization', {
          id: '1',
          divisions: [division],
          type: 'SCO',
          isManagingStudents: true,
        });
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const students = [{ id: '1', firstName: 'Spider', lastName: 'Man' }];
      const search = null;
      const divisions = [];
      const connectionTypes = [];
      const certificability = [];

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @lastnameSort={{noop}}
            @sortByLastname={{noop}}
            @participationCountOrder={{noop}}
            @sortByParticipationCount={{noop}}
            @divisionSort={{noop}}
            @sortByDivision={{noop}}
            @onClickLearner={{noop}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
          />
        </template>,
      );

      const mainCheckbox = screen.getByRole('checkbox', {
        name: t('pages.sco-organization-participants.table.column.mainCheckbox'),
      });
      const studentCheckBox = screen.getByRole('checkbox', {
        name: t('pages.sco-organization-participants.table.column.checkbox', {
          firstname: students[0].firstName,
          lastname: students[0].lastName,
        }),
      });

      // then
      assert.ok(mainCheckbox);
      assert.ok(studentCheckBox);
    });
  });

  module('action bar', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        prescriber = {};
        organization = store.createRecord('organization', {
          id: '1',
          divisions: [store.createRecord('division', { id: '3Z', name: '3Z' })],
          identityProviderForCampaigns: 'GAR',
          isManagingStudents: true,
          type: 'SCO',
        });
      }

      this.owner.register('service:current-user', CurrentUserStub);

      this.search = null;
      this.divisions = [];
      this.connectionTypes = [];
      this.certificability = [];
    });

    test('displays action bar', async function (assert) {
      // given
      const students = [
        { id: '1', firstName: 'Spider', lastName: 'Man' },
        { id: '2', firstName: 'Spider', lastName: 'Woman' },
      ];
      const search = this.search;
      const divisions = this.divisions;
      const connectionTypes = this.connectionTypes;
      const certificability = this.certificability;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @lastnameSort={{noop}}
            @sortByLastname={{noop}}
            @participationCountOrder={{noop}}
            @sortByParticipationCount={{noop}}
            @divisionSort={{noop}}
            @sortByDivision={{noop}}
            @onClickLearner={{noop}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
          />
        </template>,
      );

      const firstStudent = screen.getAllByRole('checkbox')[1];
      await click(firstStudent);

      // then
      assert.ok(screen.getByText(t('pages.sco-organization-participants.action-bar.information', { count: 1 })));
    });

    test('opens the reset password modal', async function (assert) {
      // given
      const spiderStudent = { id: '1', firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] };
      const peterStudent = {
        id: '2',
        firstName: 'Peter',
        lastName: 'Parker',
        authenticationMethods: ['email', 'identifiant'],
      };
      const milesStudent = { id: '3', firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] };
      const students = [spiderStudent, peterStudent, milesStudent];
      const search = this.search;
      const divisions = this.divisions;
      const connectionTypes = this.connectionTypes;
      const certificability = this.certificability;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @lastnameSort={{noop}}
            @sortByLastname={{noop}}
            @participationCountOrder={{noop}}
            @sortByParticipationCount={{noop}}
            @divisionSort={{noop}}
            @sortByDivision={{noop}}
            @onClickLearner={{noop}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
            @connectionTypeFilter={{connectionTypes}}
            @certificabilityFilter={{certificability}}
          />
        </template>,
      );

      const firstStudentToResetPassword = screen.getAllByRole('checkbox')[2];
      const secondStudentToResetPassword = screen.getAllByRole('checkbox')[3];

      await click(firstStudentToResetPassword);
      await click(secondStudentToResetPassword);

      const resetPasswordButton = await screen.findByRole('button', {
        name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
      });

      await click(resetPasswordButton);

      await screen.findByRole('dialog');

      const modalTitle = await screen.findByRole('heading', {
        level: 1,
        name: striptags(t('pages.sco-organization-participants.reset-password-modal.title')),
      });

      const confirmationButton = await screen.findByRole('button', {
        name: t('common.actions.confirm'),
      });

      // then
      assert.ok(modalTitle);
      assert.ok(confirmationButton);
    });

    module('when the reset password modal is open', function () {
      module('when there is no student selected with "identifiant" as an authentication method', function () {
        test('"Confirm" button is disabled', async function (assert) {
          // given
          const students = [{ id: '1', firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] }];
          const search = this.search;
          const divisions = this.divisions;
          const connectionTypes = this.connectionTypes;
          const certificability = this.certificability;
          const noop = this.noop;

          // when
          const screen = await render(
            <template>
              <ScoOrganizationParticipantList
                @students={{students}}
                @lastnameSort={{noop}}
                @sortByLastname={{noop}}
                @participationCountOrder={{noop}}
                @sortByParticipationCount={{noop}}
                @divisionSort={{noop}}
                @sortByDivision={{noop}}
                @onClickLearner={{noop}}
                @onFilter={{noop}}
                @searchFilter={{search}}
                @divisionsFilter={{divisions}}
                @connectionTypeFilter={{connectionTypes}}
                @certificabilityFilter={{certificability}}
              />
            </template>,
          );
          const student = await screen.getAllByRole('checkbox')[1];
          await click(student);
          const resetPasswordButton = await screen.findByRole('button', {
            name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
          });
          await click(resetPasswordButton);
          await screen.findByRole('dialog');
          const modalTitle = await screen.findByRole('heading', {
            level: 1,
            name: striptags(t('pages.sco-organization-participants.reset-password-modal.title')),
          });
          const confirmationButton = await screen.findByRole('button', {
            name: t('common.actions.confirm'),
          });

          // then
          assert.ok(modalTitle);
          assert.dom(confirmationButton).hasAttribute('aria-disabled');
        });
      });

      module('when there is at least one student with "identifiant" as an authentication method', function () {
        let notificationsStub;

        test('"Confirm" button is enabled', async function (assert) {
          // given
          const students = [
            { id: '1', firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
            { id: '2', firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
          ];
          const search = this.search;
          const divisions = this.divisions;
          const connectionTypes = this.connectionTypes;
          const certificability = this.certificability;
          const noop = this.noop;

          // when
          const screen = await render(
            <template>
              <ScoOrganizationParticipantList
                @students={{students}}
                @lastnameSort={{noop}}
                @sortByLastname={{noop}}
                @participationCountOrder={{noop}}
                @sortByParticipationCount={{noop}}
                @divisionSort={{noop}}
                @sortByDivision={{noop}}
                @onClickLearner={{noop}}
                @onFilter={{noop}}
                @searchFilter={{search}}
                @divisionsFilter={{divisions}}
                @connectionTypeFilter={{connectionTypes}}
                @certificabilityFilter={{certificability}}
              />
            </template>,
          );
          const firstStudent = await screen.getAllByRole('checkbox')[1];
          const secondStudent = await screen.getAllByRole('checkbox')[2];
          await click(firstStudent);
          await click(secondStudent);
          const resetPasswordButton = await screen.findByRole('button', {
            name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
          });
          await click(resetPasswordButton);
          await screen.findByRole('dialog');
          const modalTitle = await screen.findByRole('heading', {
            level: 1,
            name: striptags(t('pages.sco-organization-participants.reset-password-modal.title')),
          });
          const confirmationButton = await screen.findByRole('button', {
            name: t('common.actions.confirm'),
          });

          // then
          assert.ok(modalTitle);
          assert.dom(confirmationButton).doesNotHaveAttribute('aria-disabled');
        });

        test('closes dialog', async function (assert) {
          // given
          const adapterStore = this.owner.lookup('service:store');
          sinon
            .stub(adapterStore, 'adapterFor')
            .returns({ generateOrganizationLearnersUsernamePassword: sinon.stub().resolves() });

          const students = [
            { id: '1', firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
            { id: '2', firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
          ];
          const search = this.search;
          const divisions = this.divisions;
          const connectionTypes = this.connectionTypes;
          const certificability = this.certificability;
          const noop = this.noop;

          // when
          const screen = await render(
            <template>
              <ScoOrganizationParticipantList
                @students={{students}}
                @lastnameSort={{noop}}
                @sortByLastname={{noop}}
                @participationCountOrder={{noop}}
                @sortByParticipationCount={{noop}}
                @divisionSort={{noop}}
                @sortByDivision={{noop}}
                @onClickLearner={{noop}}
                @onFilter={{noop}}
                @searchFilter={{search}}
                @divisionsFilter={{divisions}}
                @connectionTypeFilter={{connectionTypes}}
                @certificabilityFilter={{certificability}}
              />
            </template>,
          );

          const firstStudent = await screen.getAllByRole('checkbox')[1];
          const secondStudent = await screen.getAllByRole('checkbox')[2];
          await click(firstStudent);
          await click(secondStudent);

          const resetPasswordButton = await screen.findByRole('button', {
            name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
          });
          await click(resetPasswordButton);
          await screen.findByRole('dialog');

          const confirmationButton = await screen.findByRole('button', {
            name: t('common.actions.confirm'),
          });
          await click(confirmationButton);
          const resetPasswordsModal = await screen.queryByRole('dialog');

          // then
          assert.dom(resetPasswordsModal).isNotVisible();
        });

        test('displays a successful notification', async function (assert) {
          // given
          const adapterStore = this.owner.lookup('service:store');
          sinon
            .stub(adapterStore, 'adapterFor')
            .returns({ generateOrganizationLearnersUsernamePassword: sinon.stub().resolves() });
          notificationsStub = this.owner.lookup('service:notifications');
          sinon.stub(notificationsStub, 'sendSuccess');

          const students = [
            { id: '1', firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
            { id: '2', firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
          ];
          const search = this.search;
          const divisions = this.divisions;
          const connectionTypes = this.connectionTypes;
          const certificability = this.certificability;
          const noop = this.noop;

          // when
          const screen = await render(
            <template>
              <ScoOrganizationParticipantList
                @students={{students}}
                @lastnameSort={{noop}}
                @sortByLastname={{noop}}
                @participationCountOrder={{noop}}
                @sortByParticipationCount={{noop}}
                @divisionSort={{noop}}
                @sortByDivision={{noop}}
                @onClickLearner={{noop}}
                @onFilter={{noop}}
                @searchFilter={{search}}
                @divisionsFilter={{divisions}}
                @connectionTypeFilter={{connectionTypes}}
                @certificabilityFilter={{certificability}}
              />
            </template>,
          );

          const firstStudent = await screen.getAllByRole('checkbox')[1];
          const secondStudent = await screen.getAllByRole('checkbox')[2];
          await click(firstStudent);
          await click(secondStudent);

          const resetPasswordButton = await screen.findByRole('button', {
            name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
          });
          await click(resetPasswordButton);
          await screen.findByRole('dialog');

          const confirmationButton = await screen.findByRole('button', {
            name: t('common.actions.confirm'),
          });
          await click(confirmationButton);

          // then
          sinon.assert.called(notificationsStub.sendSuccess);
          assert.ok(true);
        });

        module('#errorNotifications', function () {
          module('when the user doesn\u2019t belong to the organisation', function () {
            test('displays an error notification', async function (assert) {
              // given
              const adapterStore = this.owner.lookup('service:store');
              sinon.stub(adapterStore, 'adapterFor').returns({
                generateOrganizationLearnersUsernamePassword: sinon
                  .stub()
                  .rejects([{ code: 'USER_DOES_NOT_BELONG_TO_ORGANIZATION' }]),
              });
              notificationsStub = this.owner.lookup('service:notifications');
              sinon.stub(notificationsStub, 'sendError');

              const students = [
                { id: '1', firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
                { id: '2', firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
              ];
              const search = this.search;
              const divisions = this.divisions;
              const connectionTypes = this.connectionTypes;
              const certificability = this.certificability;
              const noop = this.noop;

              // when
              const screen = await render(
                <template>
                  <ScoOrganizationParticipantList
                    @students={{students}}
                    @lastnameSort={{noop}}
                    @sortByLastname={{noop}}
                    @participationCountOrder={{noop}}
                    @sortByParticipationCount={{noop}}
                    @divisionSort={{noop}}
                    @sortByDivision={{noop}}
                    @onClickLearner={{noop}}
                    @onFilter={{noop}}
                    @searchFilter={{search}}
                    @divisionsFilter={{divisions}}
                    @connectionTypeFilter={{connectionTypes}}
                    @certificabilityFilter={{certificability}}
                  />
                </template>,
              );

              const firstStudent = await screen.getAllByRole('checkbox')[1];
              const secondStudent = await screen.getAllByRole('checkbox')[2];
              await click(firstStudent);
              await click(secondStudent);

              const resetPasswordButton = await screen.findByRole('button', {
                name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
              });
              await click(resetPasswordButton);
              await screen.findByRole('dialog');

              const confirmationButton = await screen.findByRole('button', {
                name: t('common.actions.confirm'),
              });
              await click(confirmationButton);

              // then
              sinon.assert.calledWith(
                notificationsStub.sendError,
                t('api-error-messages.student-password-reset.user-does-not-belong-to-organization-error'),
              );
              assert.ok(true);
            });
          });

          module('when a student doesn\u2019t belong to the organisation', function () {
            test('displays an error notification', async function (assert) {
              // given
              const adapterStore = this.owner.lookup('service:store');
              sinon.stub(adapterStore, 'adapterFor').returns({
                generateOrganizationLearnersUsernamePassword: sinon
                  .stub()
                  .rejects([{ code: 'ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION' }]),
              });
              notificationsStub = this.owner.lookup('service:notifications');
              sinon.stub(notificationsStub, 'sendError');

              const students = [
                { id: '1', firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
                { id: '2', firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
              ];
              const search = this.search;
              const divisions = this.divisions;
              const connectionTypes = this.connectionTypes;
              const certificability = this.certificability;
              const noop = this.noop;

              // when
              const screen = await render(
                <template>
                  <ScoOrganizationParticipantList
                    @students={{students}}
                    @lastnameSort={{noop}}
                    @sortByLastname={{noop}}
                    @participationCountOrder={{noop}}
                    @sortByParticipationCount={{noop}}
                    @divisionSort={{noop}}
                    @sortByDivision={{noop}}
                    @onClickLearner={{noop}}
                    @onFilter={{noop}}
                    @searchFilter={{search}}
                    @divisionsFilter={{divisions}}
                    @connectionTypeFilter={{connectionTypes}}
                    @certificabilityFilter={{certificability}}
                  />
                </template>,
              );

              const firstStudent = await screen.getAllByRole('checkbox')[1];
              const secondStudent = await screen.getAllByRole('checkbox')[2];
              await click(firstStudent);
              await click(secondStudent);

              const resetPasswordButton = await screen.findByRole('button', {
                name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
              });
              await click(resetPasswordButton);
              await screen.findByRole('dialog');

              const confirmationButton = await screen.findByRole('button', {
                name: t('common.actions.confirm'),
              });
              await click(confirmationButton);

              // then
              sinon.assert.calledWith(
                notificationsStub.sendError,
                t(
                  'api-error-messages.student-password-reset.organization-learner-does-not-belong-to-organization-error',
                ),
              );
              assert.ok(true);
            });
          });

          module('when a student doesn\u2019t have a username', function () {
            test('displays an error notification', async function (assert) {
              // given
              const adapterStore = this.owner.lookup('service:store');
              sinon.stub(adapterStore, 'adapterFor').returns({
                generateOrganizationLearnersUsernamePassword: sinon.stub().rejects([
                  {
                    code: 'ORGANIZATION_LEARNER_WITHOUT_USERNAME',
                  },
                ]),
              });
              notificationsStub = this.owner.lookup('service:notifications');
              sinon.stub(notificationsStub, 'sendError');

              const students = [
                { id: '1', firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
                { id: '2', firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
              ];
              const search = this.search;
              const divisions = this.divisions;
              const connectionTypes = this.connectionTypes;
              const certificability = this.certificability;
              const noop = this.noop;

              // when
              const screen = await render(
                <template>
                  <ScoOrganizationParticipantList
                    @students={{students}}
                    @lastnameSort={{noop}}
                    @sortByLastname={{noop}}
                    @participationCountOrder={{noop}}
                    @sortByParticipationCount={{noop}}
                    @divisionSort={{noop}}
                    @sortByDivision={{noop}}
                    @onClickLearner={{noop}}
                    @onFilter={{noop}}
                    @searchFilter={{search}}
                    @divisionsFilter={{divisions}}
                    @connectionTypeFilter={{connectionTypes}}
                    @certificabilityFilter={{certificability}}
                  />
                </template>,
              );

              const firstStudent = await screen.getAllByRole('checkbox')[1];
              const secondStudent = await screen.getAllByRole('checkbox')[2];
              await click(firstStudent);
              await click(secondStudent);

              const resetPasswordButton = await screen.findByRole('button', {
                name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
              });
              await click(resetPasswordButton);
              await screen.findByRole('dialog');

              const confirmationButton = await screen.findByRole('button', {
                name: t('common.actions.confirm'),
              });
              await click(confirmationButton);

              // then
              sinon.assert.calledWith(
                notificationsStub.sendError,
                t('api-error-messages.student-password-reset.organization-learner-without-username-error'),
              );
              assert.ok(true);
            });
          });

          module('when an unrelated error occurs', function () {
            test('displays an error notification', async function (assert) {
              // given
              const adapterStore = this.owner.lookup('service:store');
              sinon.stub(adapterStore, 'adapterFor').returns({
                generateOrganizationLearnersUsernamePassword: sinon.stub().rejects([{ status: 500 }]),
              });
              notificationsStub = this.owner.lookup('service:notifications');
              sinon.stub(notificationsStub, 'sendError');

              const students = [
                { id: '1', firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
                { id: '2', firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
              ];
              const search = this.search;
              const divisions = this.divisions;
              const connectionTypes = this.connectionTypes;
              const certificability = this.certificability;
              const noop = this.noop;

              // when
              const screen = await render(
                <template>
                  <ScoOrganizationParticipantList
                    @students={{students}}
                    @lastnameSort={{noop}}
                    @sortByLastname={{noop}}
                    @participationCountOrder={{noop}}
                    @sortByParticipationCount={{noop}}
                    @divisionSort={{noop}}
                    @sortByDivision={{noop}}
                    @onClickLearner={{noop}}
                    @onFilter={{noop}}
                    @searchFilter={{search}}
                    @divisionsFilter={{divisions}}
                    @connectionTypeFilter={{connectionTypes}}
                    @certificabilityFilter={{certificability}}
                  />
                </template>,
              );

              const firstStudent = await screen.getAllByRole('checkbox')[1];
              const secondStudent = await screen.getAllByRole('checkbox')[2];
              await click(firstStudent);
              await click(secondStudent);

              const resetPasswordButton = await screen.findByRole('button', {
                name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
              });
              await click(resetPasswordButton);
              await screen.findByRole('dialog');

              const confirmationButton = await screen.findByRole('button', {
                name: t('common.actions.confirm'),
              });
              await click(confirmationButton);

              // then
              sinon.assert.called(notificationsStub.sendError);
              assert.ok(true);
            });
          });
        });
      });
    });
  });

  module('edit modal functionality', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        prescriber = {};
        canEditLearnerName = true;
        organization = store.createRecord('organization', {
          id: '1',
          divisions: [store.createRecord('division', { id: '3E', name: '3E' })],
        });
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.divisions = [];
      this.connectionTypes = [];
      this.certificability = [];
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
          isAuthenticatedFromGar: false,
        }),
      ];
      const search = this.search;
      const divisions = this.divisions;
      const connectionTypes = this.connectionTypes;
      const certificability = this.certificability;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
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
      const divisions = this.divisions;
      const connectionTypes = this.connectionTypes;
      const certificability = this.certificability;
      const noop = this.noop;

      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
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
      const divisions = this.divisions;
      const connectionTypes = this.connectionTypes;
      const certificability = this.certificability;
      const noop = this.noop;

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantList
            @students={{students}}
            @onFilter={{noop}}
            @searchFilter={{search}}
            @divisionsFilter={{divisions}}
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
