import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click } from '@ember/test-helpers';
import Service from '@ember/service';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/students | list-items', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('noop', sinon.stub());
  });

  test('it should show title of team page', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Students::ListItems @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('Élèves');
  });

  test('it should display the header labels', async function(assert) {
    // given
    this.set('students', []);

    // when
    await render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('Nom');
    assert.contains('Prénom');
    assert.contains('Date de naissance');
    assert.contains('Connecté avec');
  });

  test('it should display a list of students', async function(assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: 'L\'asticot', firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];

    this.set('students', students);

    // when
    await render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

    // then
    assert.dom('[aria-label="Élève"]').exists({ count: 2 });
  });

  test('it should display the firstName, lastName and birthdate of student', async function(assert) {
    // given
    const students = [{ lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },];

    this.set('students', students);

    // when
    await render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('01/02/2010');
  });

  module('when user is filtering some users', function() {
    test('it should trigger filtering with lastname', async function(assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      // when
      await render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}}/>`);

      await fillIn('[placeholder="Rechercher par nom"]', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'lastName');
      assert.equal(call.args[1], true);
      assert.equal(call.args[2].target.value, 'bob');
    });

    test('it should trigger filtering with firstname', async function(assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      // when
      await render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}}/>`);

      await fillIn('[placeholder="Rechercher par prénom"]', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'firstName');
      assert.equal(call.args[1], true);
      assert.equal(call.args[2].target.value, 'bob');
    });

    test('it should trigger filtering with connexionType', async function(assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('connexionTypesOptions', [{ value: '', label: 'Tous' }, { value: 'email', label: 'email' }]);

      // when
      await render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}} @connexionTypesOptions={{connexionTypesOptions}} />`);

      await fillIn('select', 'email');

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
        })
      ]);
      return render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
    });

    test('it should display dash for authentication method', async function(assert) {
      const dash = '\u2013';

      assert.dom('[aria-label="Élève"]').containsText(dash);
    });

    test('it should not display actions menu for username', async function(assert) {
      assert.dom('[aria-label="Afficher les actions"]').doesNotExist();
    });
  });

  module('when user is reconciled with username', function({ beforeEach }) {
    beforeEach(function() {
      const store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('student', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          username: 'blueivy.carter0701',
          isAuthenticatedFromGar: false,
        })
      ]);
      return render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
    });

    test('it should display "Identifiant" as authentication method', async function(assert) {
      assert.dom('[aria-label="Élève"]').containsText('Identifiant');
    });

    test('it should display actions menu', async function(assert) {
      assert.dom('[aria-label="Afficher les actions"]').exists();
    });
  });

  module('when user is reconciled with email', function({ beforeEach }) {
    beforeEach(function() {
      const store = this.owner.lookup('service:store');
      this.set('students', [
        store.createRecord('student', {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          email: 'firstname.lastname@example.net',
          isAuthenticatedFromGar: false,
        })
      ]);
      return render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
    });

    test('it should display "Adresse email" as authentication method', async function(assert) {
      assert.dom('[aria-label="Élève"]').containsText('Adresse e-mail');
    });

    test('it should display actions menu for email', async function(assert) {
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
        })
      ]);
    });

    module('when user is admin in organization', (hooks) => {
      hooks.beforeEach(function() {
        this.set('importStudentsSpy', () => {});
        this.owner.register('service:current-user', Service.extend({ isAdminInOrganization: true }));
        return render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
      });

      test('it should display import button', async function(assert) {
        assert.contains('Importer (.xml)');
      });

      test('it should display the dissociate action', async function(assert) {
        await click('[aria-label="Afficher les actions"]');

        // then
        assert.contains('Dissocier le compte');
      });
    });

    module('when user is not admin in organization', (hooks) => {
      hooks.beforeEach(function() {
        this.owner.register('service:current-user', Service.extend({ isAdminInOrganization: false }));
        return render(hbs`<Routes::Authenticated::Students::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);
      });

      test('it should not display import button', async function(assert) {
        assert.notContains('Importer (.xml)');
      });

      test('it should not display the dissociate action', async function(assert) {
        await click('[aria-label="Afficher les actions"]');

        // then
        assert.notContains('Dissocier le compte');
      });
    });
  });
});
