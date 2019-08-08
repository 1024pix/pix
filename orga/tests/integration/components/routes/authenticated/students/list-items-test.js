import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/students | list-items', function(hooks) {
  setupRenderingTest(hooks);

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
    assert.dom('.table tbody tr:first-child td:last-child').hasText('01/02/2010');
  });

  test('it should display import button', async function(assert) {
    // given
    this.set('uploadStudentsSpy', () => {});
    this.set('students', []);

    // when
    await render(hbs`{{routes/authenticated/students/list-items students=students uploadStudents=(action uploadStudentsSpy)}}`);

    // then
    assert.dom('.button').hasText('Importer');
  });

});
