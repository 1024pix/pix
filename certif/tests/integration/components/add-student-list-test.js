import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Integration | Component | add-student-list', (hooks) => {
  setupRenderingTest(hooks);

  let store;
  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  module('when there is no student', () => {
    test('it shows an empty table', async function(assert) {
      // when
      await render(hbs`<AddStudentList />`);

      // then
      assert.dom('.add-student-list').doesNotExist();
    });
  });

  module('when there are students', () => {

    test('it shows students divisons in the multiSelect', async function(assert) {
      // given
      const birthdate = new Date('2018-01-12T09:29:16Z');
      const firstStudent = _buildUnselectedStudent('first', 'last', '3A', birthdate);
      const secondStudent = _buildUnselectedStudent('second', 'lastName', '2B', birthdate);
      const thirdStudent = _buildUnselectedStudent('third', 'lastName', '3A', birthdate);

      const pixMultiSelect = '.pix-multi-select ul li';
      this.set('students', [
        firstStudent,
        secondStudent,
        thirdStudent,
      ]);
      const divisions = [{ label: '3A', value: '3A' }, { label: '2B', value: '2B' }];
      this.set('divisions', divisions);

      // when
      await render(hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`);
      const multiSelectItemsList = document.querySelectorAll(pixMultiSelect);

      // then
      assert.dom(pixMultiSelect + ' label[for=add-student-list__multi-select-3A]').includesText(firstStudent.division);
      assert.dom(pixMultiSelect + ' label[for=add-student-list__multi-select-2B]').includesText(secondStudent.division);
      assert.equal(multiSelectItemsList.length, divisions.length);
    });

    test('it shows student information in the table', async function(assert) {
      // given
      const birthdate = new Date('2018-01-12T09:29:16Z');
      const firstStudent = _buildUnselectedStudent('firstName', 'lastName', 'division', birthdate);
      const tableRow = '.add-student-list table tbody tr';
      this.set('students', [
        firstStudent,
        _buildUnselectedStudent(),
      ]);
      const divisions = [{ label: '3A', value: '3A' }, { label: '3B', value: '3B' }, { label: '3C', value: '3C' }];
      this.set('divisions', divisions);

      // when
      await render(hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`);

      // then
      assert.dom(tableRow).exists({ count: 2 });
      assert.dom(tableRow + ':nth-child(1) td:nth-child(2)').includesText(firstStudent.division);
      assert.dom(tableRow + ':nth-child(1) td:nth-child(3)').includesText(firstStudent.lastName);
      assert.dom(tableRow + ':nth-child(1) td:nth-child(4)').includesText(firstStudent.firstName);
      assert.dom(tableRow + ':nth-child(1) td:nth-child(5)').includesText('12/01/2018');
    });

    test('it should be possible to select an unselected student', async function(assert) {
      // given
      this.set('students', [
        _buildUnselectedStudent(),
      ]);
      const divisions = [{ label: '3A', value: '3A' }, { label: '3B', value: '3B' }, { label: '3C', value: '3C' }];
      this.set('divisions', divisions);

      await render(hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`);

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
      const divisions = [{ label: '3A', value: '3A' }, { label: '3B', value: '3B' }, { label: '3C', value: '3C' }];
      this.set('divisions', divisions);

      await render(hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`);

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
        const divisions = [{ label: '3A', value: '3A' }, { label: '3B', value: '3B' }, { label: '3C', value: '3C' }];
        this.set('divisions', divisions);

        await render(hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`);

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
      const divisions = [{ label: '3A', value: '3A' }, { label: '3B', value: '3B' }, { label: '3C', value: '3C' }];
      this.set('divisions', divisions);

      await render(hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`);

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
        sinon.stub(store, 'peekAll').withArgs('student').returns(studentList);

        const save = sinon.spy();
        this.set('session', EmberObject.create({
          id: 123,
          address: '13 rue des petits champs',
          accessCode: 'ABCDE',
          status: 'started',
          save,
        }));

        this.set('candidatesWasSaved', false);
        this.set('returnToSessionCandidates', () => { this.set('candidatesWasSaved', true); });

        this.set('numberOfEnrolledStudents', 0);

        const divisions = [{ label: '3E', value: '3E' }, { label: '4G', value: '4G' }];
        this.set('divisions', divisions);

        // when
        await render(hbs`<AddStudentList
          @studentList={{this.students}}
          @session={{this.session}}
          @numberOfEnrolledStudents={{this.numberOfEnrolledStudents}}
          @certificationCenterDivisions={{this.divisions}}
          @returnToSessionCandidates={{this.returnToSessionCandidates}}>
        </AddStudentList>`);
        await click(addCandidateButton);

        // then
        assert.equal(this.students, studentList);
        sinon.assert.calledWith(save, { adapterOptions: {
          sessionId: 123,
          studentListToAdd: studentList } });
        assert.equal(this.candidatesWasSaved, true);
      });
    });

    module('sticky bar', () => {
      module('when there is no enrolled students (certification candidates)', () => {
        module('when there is no selected student', () => {
          test('should not show the sticky bar', async function(assert) {
            //given
            const birthdate = new Date('2018-01-12T09:29:16Z');
            const studentList = [
              _buildUnselectedStudent('Marie', 'Dupont', '3E', birthdate),
              _buildUnselectedStudent('Tom', 'Dupont', '4G', birthdate),
            ];
            this.set('studentList', studentList);
            this.set('session', _buildSession());
            this.set('returnToSessionCandidates', () => {});
            const divisions = [{ label: '3A', value: '3A' }, { label: '3B', value: '3B' }, { label: '3C', value: '3C' }];
            this.set('divisions', divisions);

            // when
            await render(hbs`<AddStudentList
              @studentList={{this.studentList}}
              @session={{this.session}}
              @certificationCenterDivisions={{this.divisions}}
              @returnToSessionCandidates={{this.returnToSessionCandidates}}>
            </AddStudentList>`);

            // then
            assert.dom('.add-student-list__bottom-action-bar').doesNotExist();
          });
        });

        module('when there are 2 selected students', () => {
          test('it should show "2 candidat(s) sélectionné(s) | 0 candidat déjà ajoutés à la session"', async function(assert) {
            // given
            const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
            const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';
            const birthdate = new Date('2018-01-12T09:29:16Z');
            const studentList = [
              _buildUnselectedStudent('Marie', 'Dupont', '3E', birthdate),
              _buildSelectedStudent('Tom', 'Dupont', '4G', birthdate),
              _buildSelectedStudent('Paul', 'Dupont', '4G', birthdate),
            ];
            sinon.stub(store, 'peekAll').withArgs('student').returns(studentList);
            this.set('studentList', studentList);
            this.set('session', _buildSession());
            this.set('returnToSessionCandidates', () => {});
            this.set('numberOfEnrolledStudents', 0);
            const divisions = [{ label: '3A', value: '3A' }, { label: '3B', value: '3B' }, { label: '3C', value: '3C' }];
            this.set('divisions', divisions);

            // when
            await render(hbs`<AddStudentList
              @studentList={{this.studentList}}
              @session={{this.session}}
              @certificationCenterDivisions={{this.divisions}}
              @returnToSessionCandidates={{this.returnToSessionCandidates}}
              @numberOfEnrolledStudents={{this.numberOfEnrolledStudents}}>
            </AddStudentList>`);

            // then
            assert.dom(candidatesEnrolledSelector).includesText('0 candidat(s) déjà ajouté(s) à la session');
            assert.dom(candidatesSelectedSelector).includesText('2 candidat(s) sélectionné(s)');
          });
        });
      });

      module('when there is already enrolled students (certification candidates), the sticky bar is shown', () => {
        module('when there is no additional selected student', (hooks) => {

          hooks.beforeEach(async function() {
            // given
            const birthdate = new Date('2018-01-12T09:29:16Z');
            const studentList = [
              _buildUnselectedStudent('Marie', 'Dupont', '3E', birthdate, true),
              _buildUnselectedStudent('Tom', 'Dupont', '4G', birthdate, true),
            ];
            sinon.stub(store, 'peekAll').withArgs('student').returns(studentList);
            this.set('studentList', studentList);
            this.set('session', _buildSession());
            this.set('returnToSessionCandidates', () => {});
            this.set('numberOfEnrolledStudents', 2);
            const divisions = [{ label: '3A', value: '3A' }, { label: '3B', value: '3B' }, { label: '3C', value: '3C' }];
            this.set('divisions', divisions);

            // when
            await render(hbs`<AddStudentList
              @studentList={{this.studentList}}
              @session={{this.session}}
              @certificationCenterDivisions={{this.divisions}}
              @returnToSessionCandidates={{this.returnToSessionCandidates}}
              @numberOfEnrolledStudents={{this.numberOfEnrolledStudents}}>
            </AddStudentList>`);
          });

          test('it should show "Aucun candidat sélectionné | 2 candidat(s) déjà ajouté(s) à la session"', async function(assert) {
            // then
            const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
            const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';
            assert.dom(candidatesEnrolledSelector).includesText('2 candidat(s) déjà ajouté(s) à la session');
            assert.dom(candidatesSelectedSelector).includesText('Aucun candidat sélectionné');
          });

          test('it should disable the "Ajouter" button', async function(assert) {
            // then
            const addButtonDisabled = '.bottom-action-bar__actions--add-button.button--disabled';
            assert.dom(addButtonDisabled).exists();
          });
        });

        module('when there is additional selected student', (hooks) => {

          hooks.beforeEach(async function() {
            // given
            const birthdate = new Date('2018-01-12T09:29:16Z');
            const studentList = [
              _buildUnselectedStudent('Marie', 'Dupont', '3E', birthdate, true),
              _buildUnselectedStudent('Tom', 'Dupont', '4G', birthdate, true),
              _buildSelectedStudent('TomTom', 'Dupont', '4G', birthdate),
              _buildSelectedStudent('Marie-Jo', 'Dudu', '4G', birthdate),
            ];
            sinon.stub(store, 'peekAll').withArgs('student').returns(studentList);
            this.set('studentList', studentList);
            this.set('session', _buildSession());
            this.set('returnToSessionCandidates', () => {});
            this.set('numberOfEnrolledStudents', 2);
            const divisions = [{ label: '3A', value: '3A' }, { label: '3B', value: '3B' }, { label: '3C', value: '3C' }];
            this.set('divisions', divisions);

            // when
            await render(hbs`<AddStudentList
              @studentList={{this.studentList}}
              @session={{this.session}}
              @certificationCenterDivisions={{this.divisions}}
              @returnToSessionCandidates={{this.returnToSessionCandidates}}
              @numberOfEnrolledStudents={{this.numberOfEnrolledStudents}}>
            </AddStudentList>`);
          });

          test('it should show "2 candidat(s) sélectionné(s) | 2 candidat(s) déjà ajouté(s) à la session"', async function(assert) {
            // then
            const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
            const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';
            assert.dom(candidatesEnrolledSelector).includesText('2 candidat(s) déjà ajouté(s) à la session');
            assert.dom(candidatesSelectedSelector).includesText('2 candidat(s) sélectionné(s)');
          });

          test('it should show "Ajouter" button', async function(assert) {
            // then
            const addButtonDisabled = '.bottom-action-bar__actions--add-button.button--disabled';
            const addButton = '.bottom-action-bar__actions--add-button';
            assert.dom(addButtonDisabled).doesNotExist();
            assert.dom(addButton).exists();
          });
        });
      });
    });

  });

  function _buildUnselectedStudent(firstName = 'firstName', lastName = 'lastName', division = 'division', birthdate = 'birthdate', isEnrolled = false) {
    return EmberObject.create({
      firstName, lastName, division, birthdate, isSelected: false, isEnrolled,
      setSelected: function(newState) {
        if (this.isEnrolled) {
          return;
        }
        this.isSelected = newState;
      },
    });
  }

  function _buildSelectedStudent(firstName = 'firstName', lastName = 'lastName', division = 'division', birthdate = 'birthdate') {
    return EmberObject.create({
      firstName, lastName, division, birthdate, isSelected: true, isEnrolled: false,
      setSelected: function(newState) {
        if (this.isEnrolled) {
          return;
        }
        this.isSelected = newState;
      },
    });
  }

  function _buildSession(
    address = '13 rue des petits champs',
    accessCode = 'ABCDE',
    status = 'started',
    save = sinon.stub(),
  ) {
    return EmberObject.create({
      address,
      accessCode,
      status,
      save,
    });
  }
});
