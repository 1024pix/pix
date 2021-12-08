import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | Student::Sup::List', function (hooks) {
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
    this.set('groups', []);

    // when
    await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{noop}} @groups={{groups}}/>`);

    // then
    assert.contains('Numéro étudiant');
    assert.contains('Nom');
    assert.contains('Prénom');
    assert.contains('Date de naissance');
    assert.contains('Groupes');
  });

  test('it should display a list of students', async function (assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: "L'asticot", firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];
    this.set('students', students);
    this.set('groups', []);

    // when
    await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{noop}} @groups={{groups}}/>`);

    // then
    assert.dom('[aria-label="Étudiant"]').exists({ count: 2 });
  });

  test('it should display the student number, firstName, lastName and birthdate of student', async function (assert) {
    // given
    const students = [
      {
        studentNumber: 'LATERREURGIGI123',
        lastName: 'La Terreur',
        firstName: 'Gigi',
        birthdate: new Date('2010-02-01'),
        group: 'AB1',
      },
    ];

    this.set('students', students);
    this.set('groups', []);

    // when
    await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{noop}} @groups={{groups}}/>`);

    // then
    assert.contains('LATERREURGIGI123');
    assert.contains('La Terreur');
    assert.contains('Gigi');
    assert.contains('01/02/2010');
    assert.contains('AB1');
  });

  module('when user is filtering some users', function () {
    test('it should trigger filtering with lastname', async function (assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('groups', []);

      // when
      await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{triggerFiltering}} @groups={{groups}}/>`);

      await fillByLabel('Entrer un nom', 'bob');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'lastName', 'bob');
      assert.ok(true);
    });

    test('it should trigger filtering with firstname', async function (assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('groups', []);

      // when
      await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{triggerFiltering}} @groups={{groups}}/>`);

      await fillByLabel('Entrer un prénom', 'bob');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'firstName', 'bob');
      assert.ok(true);
    });

    test('it should trigger filtering with student number', async function (assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);
      this.set('groups', []);

      // when
      await render(hbs`<Student::Sup::List @students={{students}} @onFilter={{triggerFiltering}} @groups={{groups}}/>`);

      await fillByLabel('Entrer un numéro étudiant', 'LATERREURGIGI123');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'studentNumber', 'LATERREURGIGI123');
      assert.ok(true);
    });

    test('it should trigger filtering with group', async function (assert) {
      const triggerFiltering = sinon.spy();
      this.set('triggerFiltering', triggerFiltering);
      this.set('students', []);

      // when
      const { getByPlaceholderText } = await render(hbs`<Student::Sup::List
        @students={{students}}
        @onFilter={{triggerFiltering}}
        @groups={{groups}}
      />`);
      const select = await getByPlaceholderText('Rechercher par groupe');
      await click(select);
      await clickByName('L1');

      // then
      sinon.assert.calledWithExactly(triggerFiltering, 'groups', ['L1']);
      assert.ok(true);
    });
  });
});
