import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import fillInByLabel from '../../../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../../../../helpers/extended-ember-test-helpers/click-by-label';
import Service from '@ember/service';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/sco-students | list-items', function(hooks) {

  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('noop', sinon.stub());
  });

  test('it should show title of students page', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('Élèves');
  });

  test('it should display the header labels', async function(assert) {
    // given
    this.set('students', []);

    // when
    await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('Nom');
    assert.contains('Prénom');
    assert.contains('Date de naissance');
    assert.contains('Méthode(s) de connexion');
  });

  test('it should display a list of students', async function(assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: 'L\'asticot', firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];

    this.set('students', students);

    // when
    await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

    // then
    assert.dom('[aria-label="Élève"]').exists({ count: 2 });
  });

  test('it should display the firstName, lastName and birthdate of student', async function(assert) {
    // given
    const students = [{ lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') }];
    this.set('students', students);

    // when
    await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('01/02/2010');
  });

  module('when user is filtering some users', function() {

    test('it should trigger filtering with lastname', async function(assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}}/>`);

      // when
      await fillInByLabel('Entrer un nom', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'lastName');
      assert.equal(call.args[1], true);
      assert.equal(call.args[2].target.value, 'bob');
    });

    test('it should trigger filtering with firstname', async function(assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}}/>`);

      // when
      await fillInByLabel('Entrer un prénom', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'firstName');
      assert.equal(call.args[1], true);
      assert.equal(call.args[2].target.value, 'bob');
    });

    test('it should trigger filtering with connexionType', async function(assert) {
      // given
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('connectionTypesOptions', [{ value: 'email', label: 'email' }]);

      await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}} @connectionTypesOptions={{connectionTypesOptions}} />`);

      // when
      await fillInByLabel('Rechercher par méthode de connexion', 'email');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'connexionType');
      assert.equal(call.args[1], false);
      assert.equal(call.args[2].target.value, 'email');
    });
  });

  module('when user is not reconciled', function({ beforeEach }) {

    beforeEach(function() {
      const store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('student', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
        }),
      ]);
      return render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
    });

    test('it should display dash for authentication method', async function(assert) {
      const dash = '\u2013';

      assert.dom('[aria-label="Élève"]').containsText(dash);
    });

    test('it should not display actions menu for username', async function(assert) {
      assert.dom('[aria-label="Afficher les actions"]').doesNotExist();
    });
  });

  module('when user is reconciled', function({ beforeEach }) {

    beforeEach(function() {
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
      return render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
    });
    test('it should display the manage account entry menu', async function(assert) {
      // given
      await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

      // when
      await clickByLabel('Afficher les actions');

      // then
      assert.contains('Gérer le compte');
    });
  });

  module('when user authentification method is username', function({ beforeEach }) {

    beforeEach(function() {
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
      return render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
    });

    test('it should display "Identifiant" as authentication method', async function(assert) {
      assert.dom('[aria-label="Élève"]').containsText('Identifiant');
    });

    test('it should display actions menu', async function(assert) {
      assert.dom('[aria-label="Afficher les actions"]').exists();
    });

  });

  module('when user authentification method is email', function({ beforeEach }) {

    beforeEach(function() {
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
      return render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
    });

    test('it should display "Adresse email" as authentication method', async function(assert) {
      assert.dom('[aria-label="Élève"]').containsText('Adresse e-mail');
    });

    test('it should display actions menu for email', async function(assert) {
      assert.dom('[aria-label="Afficher les actions"]').exists();
    });

  });

  module('when user authentification method is samlId', function({ beforeEach }) {

    beforeEach(function() {
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

    test('it should display "Mediacentre" as authentication method', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

      // then
      assert.dom('[aria-label="Élève"]').containsText('Mediacentre');
    });

    test('it should display the action menu', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

      // then
      assert.dom('[aria-label="Afficher les actions"]').exists();
    });

  });

  module('user rights', (hooks) => {

    hooks.beforeEach(function() {
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

    module('when user is admin in organization', () => {
      module('when organization is SCO', (hooks) => {
        hooks.beforeEach(function() {
          class CurrentUserStub extends Service {
            isAdminInOrganization = true;
          }
          this.owner.register('service:current-user', CurrentUserStub);
          this.set('importStudentsSpy', () => {});
          return render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
        });

        test('it should display import XML file button', async function(assert) {
          assert.contains('Importer (.xml ou .zip)');
        });

        test('it should not display download template csv file button for agriculture/cfa organization', async function(assert) {
          assert.notContains('Télécharger le modèle');
        });

        test('it should not display the tooltip for agriculture/cfa organization', async function(assert) {
          assert.notContains('En savoir plus');
        });

        test('it should display the dissociate action', async function(assert) {
          // when
          await clickByLabel('Afficher les actions');

          // then
          assert.contains('Dissocier le compte');
        });
      });

      module('when organization is SCO and tagged as Agriculture', (hooks) => {
        hooks.beforeEach(function() {
          class CurrentUserStub extends Service {
            isAdminInOrganization = true;
            isAgriculture = true;
            organization = {};
          }
          this.set('importStudentsSpy', () => {});
          this.owner.register('service:current-user', CurrentUserStub);
          return render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
        });

        test('it should display import CSV file button', async function(assert) {
          assert.contains('Importer (.csv)');
        });

        test('it should not display download template csv button', async function(assert) {
          // then
          assert.notContains('Télécharger le modèle');
        });

        test('it should not display the tooltip', async function(assert) {
          assert.notContains('En savoir plus');
        });
      });

      module('when organization is SCO and tagged as Agriculture and CFA', (hooks) => {
        hooks.beforeEach(function() {
          class CurrentUserStub extends Service {
            isAdminInOrganization = true;
            isAgriculture = true;
            isCFA = true;
            organization = {};
            prescriber = {
              lang: 'fr',
            };
          }

          this.set('importStudentsSpy', () => {});
          this.owner.register('service:current-user', CurrentUserStub);
          return render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
        });

        test('it should still display import CSV file button', async function(assert) {
          assert.contains('Importer (.csv)');
        });

        test('it should display download template csv button', async function(assert) {
          // then
          assert.contains('Télécharger le modèle');
        });

        test('it should display the tooltip', async function(assert) {
          assert.contains('En savoir plus');
        });
      });
    });

    module('when user is not admin in organization', (hooks) => {

      hooks.beforeEach(function() {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        return render(hbs`<Routes::Authenticated::ScoStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
      });

      test('it should not display import button', async function(assert) {
        assert.notContains('Importer (.xml)');
        assert.notContains('Importer (.csv)');
      });

      test('it should not display the dissociate action', async function(assert) {
        // when
        await clickByLabel('Afficher les actions');

        // then
        assert.notContains('Dissocier le compte');
      });
    });
  });
});
