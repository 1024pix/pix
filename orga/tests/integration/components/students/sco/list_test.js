import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Student::Sco::List', function (hooks) {
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

  test('it should display the table headers', async function (assert) {
    // given
    this.set('students', []);

    // when
    await render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);

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
    await render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);

    // then
    assert.dom('[aria-label="Élève"]').exists({ count: 2 });
  });

  test('it should display the firstName, lastName, birthdate and division of student', async function (assert) {
    // given
    const students = [{ lastName: 'La Terreur', firstName: 'Gigi', division: '3B', birthdate: new Date('2010-02-01') }];
    this.set('students', students);

    // when
    await render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('01/02/2010');
    assert.contains('3B');
  });

  module('when user is filtering some users', function () {
    test('it should trigger filtering with lastname', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      await render(hbs`<Student::Sco::List @students={{students}} @onFilter={{triggerFiltering}}/>`);

      // when
      await fillByLabel('Entrer un nom', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(call.args[0], 'lastName');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(call.args[1], 'bob');
    });

    test('it should trigger filtering with firstname', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      await render(hbs`<Student::Sco::List @students={{students}} @onFilter={{triggerFiltering}}/>`);

      // when
      await fillByLabel('Entrer un prénom', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(call.args[0], 'firstName');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(call.args[1], 'bob');
    });

    test('it should trigger filtering with division', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      await render(hbs`<Student::Sco::List @students={{students}} @onFilter={{triggerFiltering}}/>`);

      // when
      await click('[for="division-3A"]');

      // then
      const call = triggerFiltering.getCall(0);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(call.args[0], 'divisions');
      assert.deepEqual(call.args[1], ['3A']);
    });

    test('it should trigger filtering with connexionType', async function (assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('connectionTypesOptions', [{ value: 'email', label: 'email' }]);

      await render(
        hbs`<Student::Sco::List @students={{students}} @onFilter={{triggerFiltering}} @connectionTypesOptions={{connectionTypesOptions}} />`
      );

      // when
      await fillByLabel('Rechercher par méthode de connexion', 'email');

      // then
      const call = triggerFiltering.getCall(0);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(call.args[0], 'connexionType');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(call.args[1], 'email');
    });
  });

  module('when user is not reconciled', function ({ beforeEach }) {
    beforeEach(function () {
      store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('student', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
        }),
      ]);
      return render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);
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
        store.createRecord('student', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          username: 'blueivy.carter0701',
          isAuthenticatedFromGar: false,
        }),
      ]);
      return render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);
    });
    test('it should display the manage account entry menu', async function (assert) {
      // given
      await render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);

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
        store.createRecord('student', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          username: 'blueivy.carter0701',
          isAuthenticatedFromGar: false,
        }),
      ]);
      return render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);
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
        store.createRecord('student', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          email: 'firstname.lastname@example.net',
          isAuthenticatedFromGar: false,
        }),
      ]);
      return render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);
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
        store.createRecord('student', {
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
      await render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);

      // then
      assert.dom('[aria-label="Élève"]').containsText('Mediacentre');
    });

    test('it should display the action menu', async function (assert) {
      // when
      await render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);

      // then
      assert.dom('[aria-label="Afficher les actions"]').exists();
    });
  });

  module('user rights', (hooks) => {
    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('student', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          email: 'firstname.lastname@example.net',
          isAuthenticatedFromGar: false,
        }),
      ]);
    });

    module('when user is admin in organization', (hooks) => {
      hooks.beforeEach(function () {
        class CurrentUserStub extends Service {
          isSCOManagingStudents = true;
          isAdminInOrganization = true;
          organization = store.createRecord('organization', { id: 1 });
        }

        this.owner.register('service:current-user', CurrentUserStub);
        return render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);
      });

      test('it should display the dissociate action', async function (assert) {
        // when
        await clickByName('Afficher les actions');

        // then
        assert.contains('Dissocier le compte');
      });
    });

    module('when user is not admin in organization', (hooks) => {
      hooks.beforeEach(function () {
        class CurrentUserStub extends Service {
          isSCOManagingStudents = true;
          isAdminInOrganization = false;
          organization = store.createRecord('organization', { id: 1 });
        }

        this.owner.register('service:current-user', CurrentUserStub);
        return render(hbs`<Student::Sco::List @students={{students}} @onFilter={{noop}}/>`);
      });

      test('it should not display the dissociate action', async function (assert) {
        // when
        await clickByName('Afficher les actions');

        // then
        assert.notContains('Dissocier le compte');
      });
    });
  });
});
