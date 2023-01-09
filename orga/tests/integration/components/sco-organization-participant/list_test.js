import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { fillByLabel, clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ScoOrganizationParticipant::List', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    this.set('noop', sinon.stub());

    store = this.owner.lookup('service:store');

    const division = store.createRecord('division', { id: '3A', name: '3A' });
    class CurrentUserStub extends Service {
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

    // when
    await render(
      hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
    );

    // then
    assert.contains('Nom');
    assert.contains('Prénom');
    assert.contains('Date de naissance');
    assert.contains('Classe');
    assert.contains('Méthode(s) de connexion');
  });

  test('it should display a list of students', async function (assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: "L'asticot", firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];

    this.set('students', students);

    // when
    await render(
      hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
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
    this.set('groups', []);

    // when
    const screen = await render(
      hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
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

    // when
    const screen = await render(
      hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
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
          this.intl.t('pages.participants-list.latest-participation-information-tooltip.aria-label')
        )
      )
      .exists();
  });

  test('[A11Y] it should have a description for screen-readers', async function (assert) {
    // given
    this.set('students', []);

    // when
    await render(
      hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
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

    // when
    await render(
      hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
    );

    // then
    assert.contains(this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'));
  });

  module('when user is filtering some users', function () {
    test('it should trigger filtering with search', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.triggerFiltering}} @onClickLearner={{this.noop}}/>`
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

      const { getByPlaceholderText, findByRole } = await render(hbs`<ScoOrganizationParticipant::List
        @students={{this.students}}
        @onFilter={{this.triggerFiltering}}
        @onClickLearner={{this.noop}}
      />`);

      // when
      const select = await getByPlaceholderText('Rechercher par classe');
      await click(select);

      await findByRole('menu');

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

      const screen = await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.triggerFiltering}} @onClickLearner={{this.noop}}/>`
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
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('certificability', []);

      const { getByPlaceholderText, findByRole } = await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.triggerFiltering}} @certificability={{this.certificability}} @onClickLearner={{this.noop}}/>`
      );

      // when
      const select = await getByPlaceholderText('Rechercher par certificabilité');
      await click(select);

      await findByRole('menu');

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

      await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.triggerFiltering}} @onResetFilter={{this.resetFiltered}} @onClickLearner={{this.noop}}/>`
      );

      // when
      await clickByName('Effacer les filtres');

      // then
      sinon.assert.called(resetFiltered);
      assert.ok(true);
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
      return render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );
    });

    test('it should display dash for authentication method', async function (assert) {
      const dash = '\u2013';

      assert.dom('[aria-label="Élève"]').containsText(dash);
    });

    test('it should not display actions menu for username', async function (assert) {
      assert.dom('[aria-label="Afficher les actions"]').doesNotExist();
    });
  });

  module('when user is reconciled', function ({ beforeEach }) {
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
      return render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );
    });
    test('it should display the manage account entry menu', async function (assert) {
      // given
      await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );

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
      return render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );
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
      return render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );
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
    });

    test('it should display "Mediacentre" as authentication method', async function (assert) {
      // when
      await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );

      // then
      assert.dom('[aria-label="Élève"]').containsText('Mediacentre');
    });

    test('it should display the action menu', async function (assert) {
      // when
      await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );

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
      const screen = await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );

      // then
      assert
        .dom(
          screen.getByLabelText(
            this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.tooltip.aria-label')
          )
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
      // when
      await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );

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
      // when
      await render(
        hbs`<ScoOrganizationParticipant::List @students={{this.students}} @onFilter={{this.noop}} @onClickLearner={{this.noop}}/>`
      );

      // then
      assert.contains('L’administrateur doit importer la base élèves en cliquant sur le bouton importer.');
    });
  });
});
