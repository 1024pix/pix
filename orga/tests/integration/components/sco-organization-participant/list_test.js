import striptags from 'striptags';
import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { fillByLabel, clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import sinon from 'sinon';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { waitForDialog } from '../../../helpers/wait-for';

module('Integration | Component | ScoOrganizationParticipant::List', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    this.set('noop', sinon.stub());

    store = this.owner.lookup('service:store');

    const division = store.createRecord('division', { id: '3A', name: '3A' });

    class CurrentUserStub extends Service {
      prescriber = {};
      isSCOManagingStudents = true;
      organization = store.createRecord('organization', {
        id: 1,
        divisions: [division],
      });
    }

    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it should display columns headers', async function (assert) {
    // given
    this.set('students', []);
    this.set('divisions', []);
    this.set('connectionTypes', []);
    this.set('certificability', []);
    this.set('search', null);

    // when
    const screen = await render(
      hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`,
    );

    // then
    assert.dom(screen.getByRole('columnheader', { name: 'Nom' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Prénom' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Date de naissance' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Méthode(s) de connexion' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Nombre de participations' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Dernière participation' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Certificabilité' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Actions' })).exists();
  });

  test('it should display a list of students', async function (assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: "L'asticot", firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];

    this.set('students', students);
    this.set('divisions', []);
    this.set('connectionTypes', []);
    this.set('certificability', []);
    this.set('search', null);

    // when
    await render(
      hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`,
    );

    // then
    assert.dom('[aria-label="Élève"]').exists({ count: 2 });
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
    this.set('students', students);
    this.set('divisions', []);
    this.set('connectionTypes', []);
    this.set('certificability', []);
    this.set('search', null);

    // when
    const screen = await render(
      hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`,
    );
    // then
    assert.dom(screen.getByRole('link', { name: 'Michel' })).hasProperty('href', /\/eleves\/22/g);
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
    this.set('students', students);
    this.set('divisions', []);
    this.set('connectionTypes', []);
    this.set('certificability', []);
    this.set('search', null);

    // when
    const screen = await render(
      hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`,
    );

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('01/02/2010');
    assert.contains('3B');
    assert.contains('42');
    assert.contains('03/01/2022');
    assert.contains('02/01/2022');
    assert
      .dom(
        screen.getByLabelText(
          this.intl.t('pages.participants-list.latest-participation-information-tooltip.aria-label'),
        ),
      )
      .exists();
  });

  test('[A11Y] it should have a description for screen-readers', async function (assert) {
    // given
    this.set('divisions', []);
    this.set('connectionTypes', []);
    this.set('certificability', []);
    this.set('search', null);

    // when
    await render(
      hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`,
    );

    // then
    assert.contains(this.intl.t('pages.sco-organization-participants.table.description'));
  });

  test('it should display participant as eligible for certification when the participant is certifiable', async function (assert) {
    // given
    this.set('students', [
      store.createRecord('sco-organization-participant', {
        isCertifiable: true,
      }),
    ]);
    this.set('divisions', []);
    this.set('connectionTypes', []);
    this.set('certificability', []);
    this.set('search', null);

    // when
    await render(
      hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`,
    );

    // then
    assert.contains(this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));
  });

  module('filters', function () {
    module('connection types', function () {
      test('displays a list of options to filter the students', async function (assert) {
        // given
        this.set('students', []);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

        // when
        await click(screen.getByLabelText('Rechercher par méthode de connexion'));
        await screen.findByRole('menu');

        // then
        assert.dom(screen.getByRole('checkbox', { name: 'Aucune' })).exists();
        assert.dom(screen.getByRole('checkbox', { name: 'Adresse e-mail' })).exists();
        assert.dom(screen.getByRole('checkbox', { name: 'Identifiant' })).exists();
        assert.dom(screen.getByRole('checkbox', { name: 'Mediacentre' })).exists();
        assert.dom(screen.getByRole('checkbox', { name: 'Sans Mediacentre' })).exists();
      });
    });
  });
  module('when user is filtering some users', function () {
    test('it should trigger filtering with search', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      await render(
        hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`,
      );

      // when
      await fillByLabel(this.intl.t('pages.sco-organization-participants.filter.search.aria-label'), 'Bob M');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'search', 'Bob M');
      assert.ok(true);
    });

    test('it should trigger filtering with division', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

      // when
      const select = await screen.getByPlaceholderText('Rechercher par classe');
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
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

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
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

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
      this.set('resetFiltered', resetFiltered);
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
        }),
      ]);
      this.set('students', []);
      this.set('divisions', ['4A']);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.resetFiltered}}
/>`);

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

        this.set('participationCountOrder', null);

        const sortByParticipationCount = sinon.spy();

        this.set('sortByParticipationCount', sortByParticipationCount);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
  @participationCountOrder={{this.participationCountOrder}}
  @sortByParticipationCount={{this.sortByParticipationCount}}
/>`);

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.participation-count.ariaLabelDefaultSort'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByParticipationCount, 'asc');
        assert.ok(true);
      });

      test('it should trigger ascending sort on participation count column when it is already sort descending', async function (assert) {
        // given
        this.set('participationCountOrder', 'desc');

        const sortByParticipationCount = sinon.spy();

        this.set('sortByParticipationCount', sortByParticipationCount);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
  @participationCountOrder={{this.participationCountOrder}}
  @sortByParticipationCount={{this.sortByParticipationCount}}
/>`);

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.participation-count.ariaLabelSortDown'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByParticipationCount, 'asc');
        assert.ok(true);
      });

      test('it should trigger descending sort on participation count column when it is already sort ascending', async function (assert) {
        // given
        this.set('participationCountOrder', 'asc');

        const sortByParticipationCount = sinon.spy();

        this.set('sortByParticipationCount', sortByParticipationCount);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
  @participationCountOrder={{this.participationCountOrder}}
  @sortByParticipationCount={{this.sortByParticipationCount}}
/>`);

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.participation-count.ariaLabelSortUp'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByParticipationCount, 'desc');
        assert.ok(true);
      });
    });

    module('lastname column', function () {
      test('it should trigger ascending sort on lastname column', async function (assert) {
        // given

        this.set('lastnameSort', null);

        const sortByLastname = sinon.spy();

        this.set('sortByLastname', sortByLastname);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
  @lastnameSort={{this.lastnameSort}}
  @sortByLastname={{this.sortByLastname}}
/>`);

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.last-name.ariaLabelDefaultSort'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByLastname, 'asc');
        assert.ok(true);
      });

      test('it should trigger ascending sort on lastname column when it is already sort descending', async function (assert) {
        // given
        this.set('lastnameSort', 'desc');

        const sortByLastname = sinon.spy();

        this.set('sortByLastname', sortByLastname);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
  @lastnameSort={{this.lastnameSort}}
  @sortByLastname={{this.sortByLastname}}
/>`);

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.last-name.ariaLabelSortDown'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByLastname, 'asc');
        assert.ok(true);
      });

      test('it should trigger descending sort on lastname column when it is already sort ascending', async function (assert) {
        // given
        this.set('lastnameSort', 'asc');

        const sortByLastname = sinon.spy();

        this.set('sortByLastname', sortByLastname);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
  @lastnameSort={{this.lastnameSort}}
  @sortByLastname={{this.sortByLastname}}
/>`);

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.last-name.ariaLabelSortUp'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByLastname, 'desc');
        assert.ok(true);
      });
    });

    module('division column', function () {
      test('it should trigger ascending sort', async function (assert) {
        // given

        this.set('divisionSort', null);

        const sortByDivision = sinon.spy();

        this.set('sortByDivision', sortByDivision);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
  @divisionSort={{this.divisionSort}}
  @sortByDivision={{this.sortByDivision}}
/>`);

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.division.ariaLabelDefaultSort'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByDivision, 'asc');
        assert.ok(true);
      });

      test('it should trigger ascending sort when it is already sort descending', async function (assert) {
        // given
        this.set('divisionSort', 'desc');

        const sortByDivision = sinon.spy();

        this.set('sortByDivision', sortByDivision);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
  @divisionSort={{this.divisionSort}}
  @sortByDivision={{this.sortByDivision}}
/>`);

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.division.ariaLabelSortDown'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByDivision, 'asc');
        assert.ok(true);
      });

      test('it should trigger descending sort when it is already sort ascending', async function (assert) {
        // given
        this.set('divisionSort', 'asc');

        const sortByDivision = sinon.spy();

        this.set('sortByDivision', sortByDivision);
        this.set('divisions', []);
        this.set('connectionTypes', []);
        this.set('certificability', []);
        this.set('search', null);

        const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
  @divisionSort={{this.divisionSort}}
  @sortByDivision={{this.sortByDivision}}
/>`);

        // when
        await click(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.division.ariaLabelSortUp'),
          ),
        );

        // then
        sinon.assert.calledWithExactly(sortByDivision, 'desc');
        assert.ok(true);
      });
    });
  });

  module('when user is not reconciled', function ({ beforeEach }) {
    beforeEach(function () {
      store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
        }),
      ]);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      return render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);
    });

    test('it should display dash for authentication method', async function (assert) {
      const dash = '\u2013';

      assert.dom('[aria-label="Élève"]').containsText(dash);
    });

    test('it should not display actions menu for username', async function (assert) {
      assert.dom('[aria-label="Afficher les actions"]').doesNotExist();
    });
  });

  module('when user is reconciled', function () {
    test('it should display the manage account entry menu', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          username: 'blueivy.carter0701',
          isAuthenticatedFromGar: false,
        }),
      ]);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

      // when
      await clickByName('Afficher les actions');

      // then
      assert.contains('Gérer le compte');
    });
  });

  module('when user authentification method is username', function ({ beforeEach }) {
    beforeEach(function () {
      const store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          username: 'blueivy.carter0701',
          isAuthenticatedFromGar: false,
        }),
      ]);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      return render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);
    });

    test('it should display "Identifiant" as authentication method', async function (assert) {
      assert.dom('[aria-label="Élève"]').containsText('Identifiant');
    });

    test('it should display actions menu', async function (assert) {
      assert.dom('[aria-label="Afficher les actions"]').exists();
    });
  });

  module('when user authentification method is email', function ({ beforeEach }) {
    beforeEach(function () {
      const store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          email: 'firstname.lastname@example.net',
          isAuthenticatedFromGar: false,
        }),
      ]);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      // when
      return render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);
    });

    test('it should display "Adresse email" as authentication method', async function (assert) {
      assert.dom('[aria-label="Élève"]').containsText('Adresse e-mail');
    });

    test('it should display actions menu for email', async function (assert) {
      assert.dom('[aria-label="Afficher les actions"]').exists();
    });
  });

  module('when user authentification method is samlId', function ({ beforeEach }) {
    beforeEach(function () {
      const store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('sco-organization-participant', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          email: null,
          username: null,
          isAuthenticatedFromGar: true,
        }),
      ]);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);
    });

    test('it should display "Mediacentre" as authentication method', async function (assert) {
      // given
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

      // then
      assert.dom('[aria-label="Élève"]').containsText('Mediacentre');
    });

    test('it should display the action menu', async function (assert) {
      // when
      await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

      // then
      assert.dom('[aria-label="Afficher les actions"]').exists();
    });

    test('it should display the certificability tooltip', async function (assert) {
      // given
      this.set('students', [
        store.createRecord('sco-organization-participant', {
          isCertifiable: true,
        }),
      ]);

      // when
      const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

      await click(
        screen.getByLabelText(
          this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.tooltip.aria-label'),
        ),
      );

      // then
      assert
        .dom(
          await screen.findByRole('tooltip', {
            name: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.tooltip.content'),
          }),
        )
        .exists();
    });
  });

  module('when there is participants but no results with filters', function () {
    test('it should display a message telling if there is no rows display', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 1 };
      this.set('students', students);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      // when
      await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

      // then
      assert.contains('Aucun élève.');
    });
  });

  module('when there is no participants in the organization', function () {
    test('it should display a message telling to use import', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 0 };
      this.set('students', students);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
      this.set('search', null);

      // when
      await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
  @onClickLearner={{this.noop}}
  @onResetFilter={{this.noop}}
/>`);

      // then
      assert.contains('L’administrateur doit importer la base élèves en cliquant sur le bouton importer.');
    });
  });

  module('when organization has type "SCO" and manage students', function () {
    test('displays checkboxes', async function (assert) {
      // given
      this.set('noop', sinon.stub());

      store = this.owner.lookup('service:store');

      const division = store.createRecord('division', { id: '3BF', name: '3BF' });
      class CurrentUserStub extends Service {
        prescriber = {};
        organization = store.createRecord('organization', {
          id: 1,
          divisions: [division],
          type: 'SCO',
          isManagingStudents: true,
        });
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const students = [{ id: 1, firstName: 'Spider', lastName: 'Man' }];
      this.set('students', students);
      this.set('search', null);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);

      // when
      const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);

      const mainCheckbox = screen.getByRole('checkbox', {
        name: this.intl.t('pages.sco-organization-participants.table.column.mainCheckbox'),
      });
      const studentCheckBox = screen.getByRole('checkbox', {
        name: this.intl.t('pages.sco-organization-participants.table.column.checkbox', {
          firstname: students[0].firstName,
          lastname: students[0].lastName,
        }),
      });

      // then
      assert.dom(mainCheckbox).exists();
      assert.dom(studentCheckBox).exists();
    });
  });

  module('action bar', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        prescriber = {};
        organization = store.createRecord('organization', {
          id: 1,
          divisions: [store.createRecord('division', { id: '3Z', name: '3Z' })],
          type: 'SCO',
          isManagingStudents: true,
        });
      }

      this.owner.register('service:current-user', CurrentUserStub);

      this.set('search', null);
      this.set('divisions', []);
      this.set('connectionTypes', []);
      this.set('certificability', []);
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    test('displays action bar', async function (assert) {
      // given
      const students = [
        { id: 1, firstName: 'Spider', lastName: 'Man' },
        { id: 2, firstName: 'Spider', lastName: 'Woman' },
      ];

      this.set('students', students);

      // when
      const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);

      const firstStudent = screen.getAllByRole('checkbox')[1];
      await click(firstStudent);

      // then
      assert
        .dom(screen.getByText(this.intl.t('pages.sco-organization-participants.action-bar.information', { count: 1 })))
        .exists();
    });

    test('opens the reset password modal', async function (assert) {
      // given
      const spiderStudent = { id: 1, firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] };
      const peterStudent = {
        id: 2,
        firstName: 'Peter',
        lastName: 'Parker',
        authenticationMethods: ['email', 'identifiant'],
      };
      const milesStudent = { id: 3, firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] };
      const students = [spiderStudent, peterStudent, milesStudent];

      this.set('students', students);

      // when
      const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);

      const firstStudentToResetPassword = screen.getAllByRole('checkbox')[2];
      const secondStudentToResetPassword = screen.getAllByRole('checkbox')[3];

      await click(firstStudentToResetPassword);
      await click(secondStudentToResetPassword);

      const resetPasswordButton = await screen.findByRole('button', {
        name: this.intl.t('pages.sco-organization-participants.action-bar.reset-password-button'),
      });

      await click(resetPasswordButton);

      await screen.findByRole('dialog');

      const modalTitle = await screen.findByRole('heading', {
        level: 1,
        name: striptags(this.intl.t('pages.sco-organization-participants.reset-password-modal.title')),
      });

      const confirmationButton = await screen.findByRole('button', {
        name: this.intl.t('common.actions.confirm'),
      });

      // then
      assert.dom(modalTitle).exists();
      assert.dom(confirmationButton).exists();
    });

    module('when the reset password modal is open', function () {
      module('when there is no student selected with "identifiant" as an authentication method', function () {
        test('"Confirm" button is disabled', async function (assert) {
          // given
          const students = [{ id: 1, firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] }];

          this.set('students', students);

          // when
          const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);
          const student = await screen.getAllByRole('checkbox')[1];
          await click(student);
          const resetPasswordButton = await screen.findByRole('button', {
            name: this.intl.t('pages.sco-organization-participants.action-bar.reset-password-button'),
          });
          await click(resetPasswordButton);
          await screen.findByRole('dialog');
          const modalTitle = await screen.findByRole('heading', {
            level: 1,
            name: striptags(this.intl.t('pages.sco-organization-participants.reset-password-modal.title')),
          });
          const confirmationButton = await screen.findByRole('button', {
            name: this.intl.t('common.actions.confirm'),
          });

          // then
          assert.dom(modalTitle).exists();
          assert.true(confirmationButton.disabled);
        });
      });

      module('when there is at least one student with "identifiant" as an authentication method', function () {
        let notificationsStub;

        test('"Confirm" button is enabled', async function (assert) {
          // given
          const students = [
            { id: 1, firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
            { id: 2, firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
          ];

          this.set('students', students);

          // when
          const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);
          const firstStudent = await screen.getAllByRole('checkbox')[1];
          const secondStudent = await screen.getAllByRole('checkbox')[2];
          await click(firstStudent);
          await click(secondStudent);
          const resetPasswordButton = await screen.findByRole('button', {
            name: this.intl.t('pages.sco-organization-participants.action-bar.reset-password-button'),
          });
          await click(resetPasswordButton);
          await screen.findByRole('dialog');
          const modalTitle = await screen.findByRole('heading', {
            level: 1,
            name: striptags(this.intl.t('pages.sco-organization-participants.reset-password-modal.title')),
          });
          const confirmationButton = await screen.findByRole('button', {
            name: this.intl.t('common.actions.confirm'),
          });

          // then
          assert.dom(modalTitle).exists();
          assert.false(confirmationButton.disabled);
        });

        test('closes dialog', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          sinon.stub(store, 'adapterFor').returns({ resetOrganizationLearnersPassword: sinon.stub().resolves() });

          const students = [
            { id: 1, firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
            { id: 2, firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
          ];

          this.set('students', students);

          // when
          const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);

          const firstStudent = await screen.getAllByRole('checkbox')[1];
          const secondStudent = await screen.getAllByRole('checkbox')[2];
          await click(firstStudent);
          await click(secondStudent);

          const resetPasswordButton = await screen.findByRole('button', {
            name: this.intl.t('pages.sco-organization-participants.action-bar.reset-password-button'),
          });
          await click(resetPasswordButton);
          await waitForDialog();

          const confirmationButton = await screen.findByRole('button', {
            name: this.intl.t('common.actions.confirm'),
          });
          await click(confirmationButton);
          const resetPasswordsModal = await screen.queryByRole('dialog');

          // then
          assert.dom(resetPasswordsModal).isNotVisible();
        });

        test('displays a successful notification', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          sinon.stub(store, 'adapterFor').returns({ resetOrganizationLearnersPassword: sinon.stub().resolves() });
          notificationsStub = this.owner.lookup('service:notifications');
          sinon.stub(notificationsStub, 'sendSuccess');

          const students = [
            { id: 1, firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
            { id: 2, firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
          ];

          this.set('students', students);

          // when
          const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);

          const firstStudent = await screen.getAllByRole('checkbox')[1];
          const secondStudent = await screen.getAllByRole('checkbox')[2];
          await click(firstStudent);
          await click(secondStudent);

          const resetPasswordButton = await screen.findByRole('button', {
            name: this.intl.t('pages.sco-organization-participants.action-bar.reset-password-button'),
          });
          await click(resetPasswordButton);
          await waitForDialog();

          const confirmationButton = await screen.findByRole('button', {
            name: this.intl.t('common.actions.confirm'),
          });
          await click(confirmationButton);

          // then
          sinon.assert.called(notificationsStub.sendSuccess);
          assert.ok(true);
        });

        module('#errorNotifications', function () {
          module('when the user doesn’t belong to the organisation', function () {
            test('displays an error notification', async function (assert) {
              // given
              const store = this.owner.lookup('service:store');
              sinon.stub(store, 'adapterFor').returns({
                resetOrganizationLearnersPassword: sinon
                  .stub()
                  .rejects([{ code: 'USER_DOES_NOT_BELONG_TO_ORGANIZATION' }]),
              });
              notificationsStub = this.owner.lookup('service:notifications');
              sinon.stub(notificationsStub, 'sendError');

              const students = [
                { id: 1, firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
                { id: 2, firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
              ];

              this.set('students', students);

              // when
              const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);

              const firstStudent = await screen.getAllByRole('checkbox')[1];
              const secondStudent = await screen.getAllByRole('checkbox')[2];
              await click(firstStudent);
              await click(secondStudent);

              const resetPasswordButton = await screen.findByRole('button', {
                name: this.intl.t('pages.sco-organization-participants.action-bar.reset-password-button'),
              });
              await click(resetPasswordButton);
              await waitForDialog();

              const confirmationButton = await screen.findByRole('button', {
                name: this.intl.t('common.actions.confirm'),
              });
              await click(confirmationButton);

              // then
              sinon.assert.calledWith(
                notificationsStub.sendError,
                this.intl.t('api-error-messages.student-password-reset.user-does-not-belong-to-organization-error'),
              );
              assert.ok(true);
            });
          });

          module('when a student doesn’t belong to the organisation', function () {
            test('displays an error notification', async function (assert) {
              // given
              const store = this.owner.lookup('service:store');
              sinon.stub(store, 'adapterFor').returns({
                resetOrganizationLearnersPassword: sinon
                  .stub()
                  .rejects([{ code: 'ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION' }]),
              });
              notificationsStub = this.owner.lookup('service:notifications');
              sinon.stub(notificationsStub, 'sendError');

              const students = [
                { id: 1, firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
                { id: 2, firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
              ];

              this.set('students', students);

              // when
              const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);

              const firstStudent = await screen.getAllByRole('checkbox')[1];
              const secondStudent = await screen.getAllByRole('checkbox')[2];
              await click(firstStudent);
              await click(secondStudent);

              const resetPasswordButton = await screen.findByRole('button', {
                name: this.intl.t('pages.sco-organization-participants.action-bar.reset-password-button'),
              });
              await click(resetPasswordButton);
              await waitForDialog();

              const confirmationButton = await screen.findByRole('button', {
                name: this.intl.t('common.actions.confirm'),
              });
              await click(confirmationButton);

              // then
              sinon.assert.calledWith(
                notificationsStub.sendError,
                this.intl.t(
                  'api-error-messages.student-password-reset.organization-learner-does-not-belong-to-organization-error',
                ),
              );
              assert.ok(true);
            });
          });

          module('when a student doesn’t have a username', function () {
            test('displays an error notification', async function (assert) {
              // given
              const store = this.owner.lookup('service:store');
              sinon.stub(store, 'adapterFor').returns({
                resetOrganizationLearnersPassword: sinon.stub().rejects([
                  {
                    code: 'ORGANIZATION_LEARNER_WITHOUT_USERNAME',
                  },
                ]),
              });
              notificationsStub = this.owner.lookup('service:notifications');
              sinon.stub(notificationsStub, 'sendError');

              const students = [
                { id: 1, firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
                { id: 2, firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
              ];

              this.set('students', students);

              // when
              const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);

              const firstStudent = await screen.getAllByRole('checkbox')[1];
              const secondStudent = await screen.getAllByRole('checkbox')[2];
              await click(firstStudent);
              await click(secondStudent);

              const resetPasswordButton = await screen.findByRole('button', {
                name: this.intl.t('pages.sco-organization-participants.action-bar.reset-password-button'),
              });
              await click(resetPasswordButton);
              await waitForDialog();

              const confirmationButton = await screen.findByRole('button', {
                name: this.intl.t('common.actions.confirm'),
              });
              await click(confirmationButton);

              // then
              sinon.assert.calledWith(
                notificationsStub.sendError,
                this.intl.t('api-error-messages.student-password-reset.organization-learner-without-username-error'),
              );
              assert.ok(true);
            });
          });

          module('when an unrelated error occurs', function () {
            test('displays an error notification', async function (assert) {
              // given
              const store = this.owner.lookup('service:store');
              sinon.stub(store, 'adapterFor').returns({
                resetOrganizationLearnersPassword: sinon.stub().rejects([{ status: 500 }]),
              });
              notificationsStub = this.owner.lookup('service:notifications');
              sinon.stub(notificationsStub, 'sendError');

              const students = [
                { id: 1, firstName: 'Spider', lastName: 'Man', authenticationMethods: ['mediacentre'] },
                { id: 2, firstName: 'Miles', lastName: 'Morales', authenticationMethods: ['identifiant'] },
              ];

              this.set('students', students);

              // when
              const screen = await render(hbs`<ScoOrganizationParticipant::List
  @students={{this.students}}
  @lastnameSort={{this.noop}}
  @sortByLastname={{this.noop}}
  @participationCountOrder={{this.noop}}
  @sortByParticipationCount={{this.noop}}
  @divisionSort={{this.noop}}
  @sortByDivision={{this.noop}}
  @onClickLearner={{this.noop}}
  @onFilter={{this.noop}}
  @searchFilter={{this.search}}
  @divisionsFilter={{this.divisions}}
  @connectionTypeFilter={{this.connectionTypes}}
  @certificabilityFilter={{this.certificability}}
/>`);

              const firstStudent = await screen.getAllByRole('checkbox')[1];
              const secondStudent = await screen.getAllByRole('checkbox')[2];
              await click(firstStudent);
              await click(secondStudent);

              const resetPasswordButton = await screen.findByRole('button', {
                name: this.intl.t('pages.sco-organization-participants.action-bar.reset-password-button'),
              });
              await click(resetPasswordButton);
              await waitForDialog();

              const confirmationButton = await screen.findByRole('button', {
                name: this.intl.t('common.actions.confirm'),
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
});
