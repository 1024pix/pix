import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import ENV from 'pix-orga/config/environment';

module('Integration | Component | SupOrganizationParticipant::List', function (hooks) {
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const group = store.createRecord('group', { name: 'L1' });
    const organization = store.createRecord('organization', { groups: [group] });
    this.set('noop', sinon.stub());

    class CurrentUserStub extends Service {
      organization = organization;
    }

    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it should display the header labels', async function (assert) {
    // given
    this.set('students', []);
    this.set('certificabilityFilter', []);
    this.set('groupFilter', []);
    this.set('searchFilter', null);
    this.set('studentNumberFilter', null);

    // when
    const screen = await render(
      hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.dom(screen.getByRole('columnheader', { name: 'Numéro étudiant' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Nom' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Prénom' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Date de naissance' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Groupes' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Actions' })).exists();
  });

  test('it should display a list of students', async function (assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: "L'asticot", firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];
    this.set('students', students);
    this.set('certificabilityFilter', []);
    this.set('groupFilter', []);
    this.set('searchFilter', null);
    this.set('studentNumberFilter', null);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then

    assert.dom('[aria-label="Étudiant"]').exists({ count: 2 });
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
    this.set('students', students);
    this.set('certificabilityFilter', []);
    this.set('groupFilter', []);
    this.set('searchFilter', null);
    this.set('studentNumberFilter', null);

    // when
    const screen = await render(
      hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );
    // then
    assert.dom(screen.getByRole('link', { name: 'Kenobi' })).hasProperty('href', /\/etudiants\/33/g);
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

    this.set('students', students);
    this.set('groups', []);
    this.set('certificabilityFilter', []);
    this.set('groupFilter', []);
    this.set('searchFilter', null);
    this.set('studentNumberFilter', null);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.contains('LATERREURGIGI123');
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('01/02/2010');
    assert.contains('AB1');
    assert.contains('88');
    assert.contains('03/01/2022');
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

    this.set('students', students);
    this.set('certificabilityFilter', []);
    this.set('groupFilter', []);
    this.set('searchFilter', null);
    this.set('studentNumberFilter', null);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.contains('SUP - Campagne de collecte de profils');
    assert.contains('Collecte de profils');
    assert.contains('reçu');
  });

  test('it should display participant as eligible for certification when the sup participant is certifiable', async function (assert) {
    // given
    const students = [
      {
        lastParticipationDate: new Date('2022-01-03'),
        campaignName: 'SUP - Campagne de collecte de profils',
        campaignType: 'PROFILES_COLLECTION',
        participationStatus: 'SHARED',
        isCertifiable: true,
      },
    ];

    this.set('students', students);
    this.set('certificabilityFilter', []);
    this.set('groupFilter', []);
    this.set('searchFilter', null);
    this.set('studentNumberFilter', null);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.contains(this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));
  });

  test('it should display since when the sup participant is certifiable', async function (assert) {
    // given
    const students = [
      {
        lastParticipationDate: new Date('2022-01-03'),
        campaignName: 'SUP - Campagne de collecte de profils',
        campaignType: 'PROFILES_COLLECTION',
        participationStatus: 'SHARED',
        isCertifiable: true,
        certifiableAt: new Date('2022-01-03'),
      },
    ];

    this.set('students', students);
    this.set('certificabilityFilter', []);
    this.set('groupFilter', []);
    this.set('searchFilter', null);
    this.set('studentNumberFilter', null);

    // when
    await render(
      hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    assert.contains('03/01/2022');
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

    this.set('students', students);
    this.set('groups', []);
    this.set('certificabilityFilter', []);
    this.set('groupFilter', []);
    this.set('searchFilter', null);
    this.set('studentNumberFilter', null);

    // when
    const screen = await render(
      hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
    );

    // then
    await click(
      screen.getByLabelText(
        this.intl.t('pages.sup-organization-participants.table.column.is-certifiable.tooltip.aria-label'),
      ),
    );

    // then
    assert
      .dom(
        await screen.findByRole('tooltip', {
          name: this.intl.t('pages.sup-organization-participants.table.column.is-certifiable.tooltip.content'),
        }),
      )
      .exists();
  });

  module('when user is filtering some users', function () {
    test('it should trigger filtering with search', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      // when
      await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );

      // when
      await fillByLabel(this.intl.t('pages.sup-organization-participants.filter.search.aria-label'), 'Bob M');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'search', 'Bob M');
      assert.ok(true);
    });

    test('it should trigger filtering with student number', async function (assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('groups', []);
      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      // when
      await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );

      await fillByLabel('Entrer un numéro étudiant', 'LATERREURGIGI123');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'studentNumber', 'LATERREURGIGI123');
      assert.ok(true);
    });

    test('it should trigger filtering with group', async function (assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('groups', []);
      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );

      const select = await screen.getByPlaceholderText('Rechercher par groupe');
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
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.triggerFiltering}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
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
      this.set('participationCountOrder', null);

      const sortByParticipationCount = sinon.spy();

      this.set('sortByParticipationCount', sortByParticipationCount);
      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @participationCountOrder={{this.participationCountOrder}}
  @sortByParticipationCount={{this.sortByParticipationCount}}
/>`,
      );

      // when
      await click(
        screen.getByLabelText(
          this.intl.t('pages.sup-organization-participants.table.column.participation-count.ariaLabelDefaultSort'),
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

      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @participationCountOrder={{this.participationCountOrder}}
  @sortByParticipationCount={{this.sortByParticipationCount}}
/>`,
      );
      // when
      await click(
        screen.getByLabelText(
          this.intl.t('pages.sup-organization-participants.table.column.participation-count.ariaLabelSortDown'),
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

      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @participationCountOrder={{this.participationCountOrder}}
  @sortByParticipationCount={{this.sortByParticipationCount}}
/>`,
      );

      // when
      await click(
        screen.getByLabelText(
          this.intl.t('pages.sup-organization-participants.table.column.participation-count.ariaLabelSortUp'),
        ),
      );

      // then
      sinon.assert.calledWithExactly(sortByParticipationCount, 'desc');
      assert.ok(true);
    });

    test('it should trigger ascending sort on lastname column', async function (assert) {
      // given

      this.set('lastnameSort', null);

      const sortByLastname = sinon.spy();

      this.set('sortByLastname', sortByLastname);

      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @lastnameSort={{this.lastnameSort}}
  @sortByLastname={{this.sortByLastname}}
/>`,
      );

      // when
      await click(
        screen.getByLabelText(
          this.intl.t('pages.sup-organization-participants.table.column.last-name.ariaLabelDefaultSort'),
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

      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @lastnameSort={{this.lastnameSort}}
  @sortByLastname={{this.sortByLastname}}
/>`,
      );

      // when
      await click(
        screen.getByLabelText(
          this.intl.t('pages.sup-organization-participants.table.column.last-name.ariaLabelSortDown'),
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

      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
  @lastnameSort={{this.lastnameSort}}
  @sortByLastname={{this.sortByLastname}}
/>`,
      );

      // when
      await click(
        screen.getByLabelText(
          this.intl.t('pages.sup-organization-participants.table.column.last-name.ariaLabelSortUp'),
        ),
      );

      // then
      sinon.assert.calledWithExactly(sortByLastname, 'desc');
      assert.ok(true);
    });
  });

  module('when filter result does not match current participant information', function () {
    test('it should display a no student message', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 1 };
      this.set('students', students);

      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      // when
      await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );

      // then
      assert.contains('Aucun étudiant.');
    });
  });

  module('when there is no participants in the organization', function () {
    test('it should display an import students message', async function (assert) {
      // given
      const students = [];
      students.meta = { participantCount: 0 };
      this.set('students', students);

      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      // when
      await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );

      // then
      assert.contains('L’administrateur doit importer les étudiants en cliquant sur le bouton importer.');
    });
  });

  module('when user is admin of organisation', function (hooks) {
    hooks.beforeEach(function () {
      ENV.APP.FT_DELETE_PARTICIPANT = true;

      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', { groups: [] });

      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        organization = organization;
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    hooks.afterEach(function () {
      ENV.APP.FT_DELETE_PARTICIPANT = false;
    });

    test('it should display checkboxes', async function (assert) {
      // given
      const students = [{ id: 1, firstName: 'Spider', lastName: 'Man', group: 'A1' }];
      students.meta = { participantCount: students.length };
      this.set('students', students);

      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);
      this.set('onFilter', sinon.stub());
      this.set('onClickLearner', sinon.stub());
      this.set('onResetFilter', sinon.stub());
      this.set('participationCountOrder', null);
      this.set('sortByParticipationCount', sinon.stub());
      this.set('sortByLastname', sinon.stub());
      this.set('lastnameSort', null);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );

      // then
      assert
        .dom(screen.getByLabelText(this.intl.t('pages.organization-participants.table.column.mainCheckbox')))
        .exists();
    });
  });

  module('when user is not admin of organisation', function (hooks) {
    hooks.beforeEach(function () {
      ENV.APP.FT_DELETE_PARTICIPANT = true;
    });

    hooks.afterEach(function () {
      ENV.APP.FT_DELETE_PARTICIPANT = false;
    });

    test('it should not display checkboxes', async function (assert) {
      //given
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', { groups: [] });
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        organization = organization;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const students = [{ id: 1, firstName: 'Spider', lastName: 'Man' }];
      students.meta = { participantCount: 0 };
      this.set('students', students);

      this.set('certificabilityFilter', []);
      this.set('groupFilter', []);
      this.set('searchFilter', null);
      this.set('studentNumberFilter', null);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::List
  @students={{this.students}}
  @onFilter={{this.noop}}
  @onClickLearner={{this.noop}}
  @searchFilter={{this.searchFilter}}
  @groupsFilter={{this.groupFilter}}
  @studentNumberFilter={{this.studentNumberFilter}}
  @certificabilityFilter={{this.certificabilityFilter}}
/>`,
      );

      // then
      assert
        .dom(screen.queryByLabelText(this.intl.t('pages.organization-participants.table.column.mainCheckbox')))
        .doesNotExist();
    });
  });
});
