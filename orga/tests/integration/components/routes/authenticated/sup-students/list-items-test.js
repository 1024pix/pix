import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/sup-students | list-items', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('noop', sinon.stub());
  });

  test('it should show title of team page', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::SupStudents::ListItems @triggerFiltering={{noop}}/>`);

    // then
    assert.contains('Étudiants');
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
    const students = [{ lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },];

    this.set('students', students);

    // when
    await render(hbs`<Routes::Authenticated::SupStudents::ListItems @students={{students}} @triggerFiltering={{noop}}/>`);

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
      await render(hbs`<Routes::Authenticated::SupStudents::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}}/>`);

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
      await render(hbs`<Routes::Authenticated::SupStudents::ListItems @students={{students}} @triggerFiltering={{triggerFiltering}}/>`);

      await fillIn('[placeholder="Rechercher par prénom"]', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'firstName');
      assert.equal(call.args[1], true);
      assert.equal(call.args[2].target.value, 'bob');
    });
  });
});
