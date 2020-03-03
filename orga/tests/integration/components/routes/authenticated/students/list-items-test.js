import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import Service from '@ember/service';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/students | list-items', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display the header names', async function(assert) {
    // given
    this.set('students', []);

    // when
    await render(hbs`{{routes/authenticated/students/list-items students=students}}`);

    // then
    assert.dom('.table thead tr th').exists({ count: 4 });
    assert.dom('.table thead tr th:first-child').hasText('Nom');
    assert.dom('.table thead tr th:nth-child(2)').hasText('Prénom');
    assert.dom('.table thead tr th:nth-child(3)').hasText('Date de naissance');
    assert.dom('.table thead tr th:nth-child(4)').hasText('Connecté avec');
    assert.dom('.table thead tr th:last-child').hasText('Mot de passe');
  });

  test('it should display a list of students', async function(assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: 'L\'asticot', firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];

    this.set('students', students);

    // when
    await render(hbs`{{routes/authenticated/students/list-items students=students}}`);

    // then
    assert.dom('.table tbody tr').exists();
    assert.dom('.table tbody tr').exists({ count: 2 });
  });

  test('it should display the firstName, lastName and birthdate of student', async function(assert) {
    // given
    const students = [
      { lastName: 'La Terreur', firstName: 'Gigi', birthdate: new Date('2010-02-01') },
      { lastName: 'L\'asticot', firstName: 'Gogo', birthdate: new Date('2010-05-10') },
    ];

    this.set('students', students);

    // when
    await render(hbs`{{routes/authenticated/students/list-items students=students}}`);

    // then
    assert.dom('.table tbody tr:first-child td:first-child').hasText('La Terreur');
    assert.dom('.table tbody tr:first-child td:nth-child(2)').hasText('Gigi');
    assert.dom('.table tbody tr:first-child td:nth-child(3)').hasText('01/02/2010');
  });

  module('it should display the authentication method', ()=> {

    test('it should display dash when not reconcilied', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const dash = '\u2013';

      const storedStudents = [];
      [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
        },
      ].forEach((student) => {
        storedStudents.push(run(() => store.createRecord('student', student)));
      });

      this.set('students', storedStudents);

      // when
      await render(hbs`{{routes/authenticated/students/list-items students=students}}`);

      // then
      assert.dom('.table tbody tr:first-child td:first-child').hasText('La Terreur');
      assert.dom('.table tbody tr:first-child td:nth-child(2)').hasText('Gigi');
      assert.dom('.table tbody tr:first-child td:nth-child(3)').hasText('01/01/2010');
      assert.dom('.table tbody tr:first-child td:nth-child(4)').hasText(dash);
    });
    test('it should display Identifiant when identified by username', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');

      const storedStudents = [];
      [
        {
          lastName: 'La Terreur',
          firstName: 'Gigi',
          birthdate: '2010-01-01',
          username: 'blueivy.carter0701',
          isAuthenticatedFromGar: false,
        },
      ].forEach((student) => {
        storedStudents.push(run(() => store.createRecord('student', student)));
      });

      this.set('students', storedStudents);

      // when
      await render(hbs`{{routes/authenticated/students/list-items students=students}}`);

      // then
      assert.dom('.table tbody tr:first-child td:first-child').hasText('La Terreur');
      assert.dom('.table tbody tr:first-child td:nth-child(2)').hasText('Gigi');
      assert.dom('.table tbody tr:first-child td:nth-child(3)').hasText('01/01/2010');
      assert.dom('.table tbody tr:first-child td:nth-child(4)').hasText('Identifiant');
    });

  });
  module('when student have a username', () => {

    test('it should display the student\'s firstName, lastName and birthdate, and password update button', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const student =
        run(() => store.createRecord('student', {
          id: 1,
          lastName: 'lastName',
          firstName: 'firstName',
          birthdate: new Date('2008-10-01'),
          username: 'firstname.lastname0110'
        }));

      this.set('students', [student]);

      // when
      await render(hbs`{{routes/authenticated/students/list-items students=students}}`);

      // then
      assert.dom('.table tbody tr:first-child td:first-child').hasText('lastName');
      assert.dom('.table tbody tr:first-child td:nth-child(2)').hasText('firstName');
      assert.dom('.table tbody tr:first-child td:nth-child(3)').hasText('01/10/2008');
      assert.dom('.table tbody tr:first-child td:last-child button').hasText('Réinitialiser');
    });

    test('it should not display password update button when student have not username', async function(assert) {
      const store = this.owner.lookup('service:store');

      const storedStudents = [];
      [
        {
          id: 1,
          firstName: 'Paul',
          lastName: 'Durant',
          birthdate: new Date('2008-10-01'),
        },
        {
          id: 2,
          firstName: 'Jackie',
          lastName: 'Coogan',
          birthdate: new Date('2004-10-26'),
          username: 'jackie.coogan2610'
        },
      ].forEach((student) => {
        storedStudents.push(run(() => store.createRecord('student', student)));
      });

      this.set('students', storedStudents);

      // when
      await render(hbs`{{routes/authenticated/students/list-items students=students}}`);

      // then
      assert.dom('.table tbody tr:first-child td:last-child button').doesNotExist();
      assert.dom('.table tbody tr:nth-child(2) td:last-child button').hasText('Réinitialiser');
    });

  });

  module('when user is admin in organization', (hooks) => {

    hooks.beforeEach(function() {
      this.set('importStudentsSpy', () => {});
      this.owner.register('service:current-user', Service.extend({ isAdminInOrganization: true }));
      this.set('students', []);
    });

    test('it should display import button', async function(assert) {
      // when
      await render(hbs`{{routes/authenticated/students/list-items students=students importStudents=(action importStudentsSpy)}}`);

      // then
      assert.dom('.button').hasText('Importer (.xml)');
    });
  });

  module('when user is not admin in organization', () => {

    test('it should not display import button', async function(assert) {
      // given
      this.owner.register('service:current-user', Service.extend({ isAdminInOrganization: false }));

      this.set('students', []);

      // when
      await render(hbs`{{routes/authenticated/students/list-items students=students}}`);

      // then
      assert.dom('.button').doesNotExist();
    });
  });

});
