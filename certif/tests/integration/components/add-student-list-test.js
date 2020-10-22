import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | add-student-list', function(hooks) {
  setupRenderingTest(hooks);

  module('when there is no student', () => {
    test('it shows an empty table', async function(assert) {
      // when
      await render(hbs`<AddStudentList />`);

      // then
      assert.dom('.add-student-list').doesNotExist();
    });
  });

  module('when there are students', () => {
    test('it shows student information in the table', async function(assert) {
      // given
      const birthdate = new Date('2018-01-12T09:29:16Z');
      const firstStudent = _buildUnselectedStudent('firstName', 'lastName', 'division', birthdate);
      const tableRow = '.table.add-student-list tbody tr';
      this.set('students', [
        firstStudent,
        _buildUnselectedStudent(),
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

    test('it should possible to check student', async function(assert) {
      // given
      this.set('students', [
        _buildUnselectedStudent('toto', 'toto', 'toto', '2020-09-03'),
      ]);
      await render(hbs`<AddStudentList @studentList={{this.students}}></AddStudentList>`);

      // when
      const firstStudentCheckbox = '.add-student-list__column-checkbox button:nth-of-type(1)';
      await click(firstStudentCheckbox);

      // then
      assert.equal(this.students[0].isSelected, true);
    });

    test('it should be possible to unselect a selected student', async function(assert) {
      // given
      this.set('students', [
        _buildSelectedStudent(),
      ]);
      await render(hbs`<AddStudentList @studentList={{this.students}}></AddStudentList>`);

      // when
      const firstStudentCheckbox = '.add-student-list__column-checkbox button:nth-of-type(1)';
      await click(firstStudentCheckbox);

      // then
      assert.equal(this.students[0].isSelected, false);
    });

    [
      {
        testLabel: 'it should be possible to select all students when they are all unselected',
        students: [
          _buildUnselectedStudent(),
          _buildUnselectedStudent(),
        ],
      },
      {
        testLabel: 'it should be possible to select all students whether they are already selected or not',
        students: [
          _buildSelectedStudent(),
          _buildUnselectedStudent(),
        ],
      },
    ].forEach(({ testLabel, students }) => {
      test(testLabel, async function(assert) {
        // given
        this.set('students', students);
        await render(hbs`<AddStudentList @studentList={{this.students}}></AddStudentList>`);

        // when
        const selectAllCheckbox = '.add-student-list__checker';
        await click(selectAllCheckbox);

        // then
        assert.equal(this.students.every((s) => s.isSelected), true);
      });
    });

    test('it should be possible to unselect all students when they are all selected', async function(assert) {
      // given
      this.set('students', [
        _buildSelectedStudent(),
        _buildSelectedStudent(),
      ]);
      await render(hbs`<AddStudentList @studentList={{this.students}}></AddStudentList>`);

      // when
      const selectAllCheckbox = '.add-student-list__checker';
      await click(selectAllCheckbox);

      // then
      assert.equal(this.students.every((s) => s.isSelected), false);
    });

    module('when students are checked', () => {
      test('it should be possible to add these students as candidates', async function(assert) {
        // given
        const addCandidateButton = '.add-student-list__bottom-action-bar button';
        const birthdate = new Date('2018-01-12T09:29:16Z');
        const studentList = [
          _buildSelectedStudent('Marie', 'Dupont', '3E', birthdate),
          _buildSelectedStudent('Tom', 'Dupont', '4G', birthdate),
        ];
        this.set('students', studentList);
        this.set('session', EmberObject.create({
          address: '13 rue des petits champs',
          accessCode: 'ABCDE',
          status: 'started',
          save: () => { this.set('certificationCandidates', studentList); },
        }));
        this.set('candidatesWasSaved', false);
        this.set('returnToSessionCandidates', () => { this.set('candidatesWasSaved', true); });

        // when
        await render(hbs`<AddStudentList
          @studentList={{this.students}}
          @session={{this.session}}
          @returnToSessionCandidates={{this.returnToSessionCandidates}}>
        </AddStudentList>`);
        await click(addCandidateButton);

        // then
        assert.equal(this.students, studentList);
        assert.equal(this.certificationCandidates, studentList);
        assert.equal(this.candidatesWasSaved, true);
      });
    });
  });

  function _buildUnselectedStudent(firstName, lastName, division, birthdate) {
    return EmberObject.create({
      firstName, lastName, division, birthdate, isSelected: false,
    });
  }

});
