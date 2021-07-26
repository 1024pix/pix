import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import fillInByLabel from '../../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Student::Sup::List', function(hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('noop', sinon.stub());
  });

  test('it should display the header labels', async function(assert) {
    // given
    this.set('students', []);

    // when
    await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{noop}}/>`);

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
    await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{noop}}/>`);

    // then
    assert.dom('[aria-label="Étudiant"]').exists({ count: 2 });
  });

  test('it should display the student number, firstName, lastName and birthdate of student', async function(assert) {
    // given
    const students = [{ studentNumber: 'LATERREURGIGI123', lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') }];

    this.set('students', students);

    // when
    await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{noop}}/>`);

    // then
    assert.contains('LATERREURGIGI123');
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
      await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{triggerFiltering}}/>`);

      await fillInByLabel('Entrer un nom', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'lastName');
      assert.true(call.args[1]);
      assert.equal(call.args[2].target.value, 'bob');
    });

    test('it should trigger filtering with firstname', async function(assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      // when
      await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{triggerFiltering}}/>`);

      await fillInByLabel('Entrer un prénom', 'bob');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'firstName');
      assert.true(call.args[1]);
      assert.equal(call.args[2].target.value, 'bob');
    });

    test('it should trigger filtering with student number', async function(assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      // when
      await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{triggerFiltering}}/>`);

      await fillInByLabel('Entrer un numéro étudiant', 'LATERREURGIGI123');

      // then
      const call = triggerFiltering.getCall(0);
      assert.equal(call.args[0], 'studentNumber');
      assert.true(call.args[1]);
      assert.equal(call.args[2].target.value, 'LATERREURGIGI123');
    });
  });
});
