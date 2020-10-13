import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | add-student-list', function(hooks) {
  setupRenderingTest(hooks);

  module('when there is no student', () => {
    test('it shows an empty table', async function(assert) {

      await render(hbs`<AddStudentList />`);

      assert.dom('.table.add-student-list tbody tr td').doesNotExist();
    });
  });

  module('when there are students', () => {
    test('it shows student information in the table', async function(assert) {
      // given
      const birthdate = new Date('2018-01-12T09:29:16Z');
      const firstStudent =  _buildStudent('firstName', 'lastName', 'division',birthdate);
      await render(hbs`<AddStudentList />`);
      const tableRow = '.table.add-student-list tbody tr';
      this.set('students', [
        firstStudent,
        _buildStudent(),
      ]);

      // when
      await render(hbs`<AddStudentList @studentList={{this.students}}></AddStudentList>`);

      // then
      assert.dom(tableRow).exists({ count: 2 });
      assert.dom(tableRow + ':nth-child(1) td:nth-child(2)').includesText(firstStudent.division);
      assert.dom(tableRow + ':nth-child(1) td:nth-child(3)').includesText(firstStudent.lastName);
      assert.dom(tableRow + ':nth-child(1) td:nth-child(4)').includesText(firstStudent.firstName);
      assert.dom(tableRow + ':nth-child(1) td:nth-child(5)').includesText('12/01/2018');
    });
  });

  function _buildStudent(firstName, lastName, division, birthdate) {
    return {
      firstName, lastName, division, birthdate,
    };
  }

});
