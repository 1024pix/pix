import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import fillInByLabel from '../../../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import Service from '@ember/service';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/sup-students | list-items', (hooks) => {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('noop', sinon.stub());
  });

  test('it should show title of team page', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::SupStudents::ListItems @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('Étudiants');
  });

  module('when user is admin', (hooks) => {
    hooks.beforeEach(function() {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1 });
        isAdminInOrganization = true;
        prescriber = {
          lang: 'fr',
        }
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should display download template button', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::SupStudents::ListItems @triggerFiltering={{noop}}/>`);

      // then
      assert.contains('Télécharger le modèle');
    });

    test('it displays the import button', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::SupStudents::ListItems @triggerFiltering={{noop}}/>`);

      // then
      assert.contains('Importer (.csv)');
    });
  });

  module('when user is only member', (hooks) => {
    hooks.beforeEach(function() {
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should not display download template button', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::SupStudents::ListItems @triggerFiltering={{noop}}/>`);

      // then
      assert.notContains('Télécharger le modèle');
    });

    test('it should not display import button', async function(assert) {
      // when
      await render(hbs`<Routes::Authenticated::SupStudents::ListItems @triggerFiltering={{noop}}/>`);

      // then
      assert.notContains('Importer (.csv)');
    });
  });

  test('it should display the header labels', async function(assert) {
    // given
    this.set('students', []);

    // when
    await render(hbs`<Routes::Authenticated::SupStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('Numéro étudiant');
    assert.contains('Nom');
    assert.contains('Prénom');
    assert.contains('Date de naissance');
  });

  test('it should display a list of students', async function(assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: 'L\'asticot', firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];

    this.set('students', students);

    // when
    await render(hbs`<Routes::Authenticated::SupStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

    // then
    assert.dom('[aria-label="Étudiant"]').exists({ count: 2 });
  });

  test('it should display the firstName, lastName and birthdate of student', async function(assert) {
    // given
    const students = [{ lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') }];

    this.set('students', students);

    // when
    await render(hbs`<Routes::Authenticated::SupStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('01/02/2010');
  });

  module('when user is filtering some users', () => {
    test('it should trigger filtering with lastname', async function(assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      // when
      await render(hbs`<Routes::Authenticated::SupStudents::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}}/>`);

      await fillInByLabel('Entrer un nom', 'bob');

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
      await render(hbs`<Routes::Authenticated::SupStudents::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}}/>`);

      await fillInByLabel('Entrer un prénom', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'firstName');
      assert.equal(call.args[1], true);
      assert.equal(call.args[2].target.value, 'bob');
    });
  });
});
