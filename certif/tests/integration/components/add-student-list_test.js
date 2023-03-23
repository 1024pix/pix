import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | add-student-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  const ADD_BUTTON_SELECTOR = '.bottom-action-bar__actions--add-button';
  let notificationMessagesService;
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    notificationMessagesService = this.owner.lookup('service:notifications');
  });

  hooks.afterEach(function () {
    notificationMessagesService.clearAll();
  });

  module('when there is no student', () => {
    test('it shows an empty table', async function (assert) {
      // when
      await render(hbs`<AddStudentList />`);

      // then
      assert.dom('.add-student-list').doesNotExist();
    });
  });

  module('when there are students', () => {
    test('it shows students divisions in the multiSelect', async function (assert) {
      // given
      const birthdate = new Date('2018-01-12T09:29:16Z');
      const firstStudent = _buildUnselectedStudent('first', 'last', '3A', birthdate);
      const secondStudent = _buildUnselectedStudent('second', 'lastName', '2B', birthdate);
      const thirdStudent = _buildUnselectedStudent('third', 'lastName', '3A', birthdate);

      const students = [firstStudent, secondStudent, thirdStudent];
      students.meta = {
        page: 1,
        pageSize: 25,
        rowCount: 1,
        pageCount: 1,
      };
      this.set('students', students);

      const divisions = [
        { label: '3A', value: '3A' },
        { label: '2B', value: '2B' },
      ];
      this.set('divisions', divisions);

      // when
      const screen = await render(hbs`
        <AddStudentList
          @studentList={{this.students}}
          @certificationCenterDivisions={{this.divisions}}
        />
      `);
      await click(
        screen.getByRole('textbox', { name: 'Filtrer la liste des élèves en cochant la ou les classes souhaitées' })
      );
      await screen.findByRole('menu');

      // then
      assert.dom(screen.getByRole('checkbox', { name: '3A' })).exists();
      assert.dom(screen.getByRole('checkbox', { name: '2B' })).exists();
    });

    test('it shows student information in the table', async function (assert) {
      // given
      const birthdate = new Date('2018-01-12T09:29:16Z');
      const firstStudent = _buildUnselectedStudent('firstName', 'lastName', 'division', birthdate);
      const tableRow = '.add-student-list table tbody tr';

      const students = [firstStudent, _buildUnselectedStudent()];
      students.meta = {
        page: 1,
        pageSize: 25,
        rowCount: 1,
        pageCount: 1,
      };
      this.set('students', students);

      const divisions = [
        { label: '3A', value: '3A' },
        { label: '3B', value: '3B' },
        { label: '3C', value: '3C' },
      ];
      this.set('divisions', divisions);

      // when
      await render(
        hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`
      );

      // then
      assert.dom(tableRow).exists({ count: 2 });
      assert.dom(tableRow + ':nth-child(1) td:nth-child(2)').includesText(firstStudent.division);
      assert.dom(tableRow + ':nth-child(1) td:nth-child(3)').includesText(firstStudent.lastName);
      assert.dom(tableRow + ':nth-child(1) td:nth-child(4)').includesText(firstStudent.firstName);
      assert.dom(tableRow + ':nth-child(1) td:nth-child(5)').includesText('12/01/2018');
    });

    test('it should be possible to select an unselected student', async function (assert) {
      // given
      const students = [_buildUnselectedStudent()];
      students.meta = {
        page: 1,
        pageSize: 25,
        rowCount: 1,
        pageCount: 1,
      };
      this.set('students', students);

      const divisions = [
        { label: '3A', value: '3A' },
        { label: '3B', value: '3B' },
        { label: '3C', value: '3C' },
      ];
      this.set('divisions', divisions);

      await render(
        hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`
      );

      // when
      const firstStudentCheckbox = '.add-student-list__column-checkbox button:nth-of-type(1)';
      await click(firstStudentCheckbox);

      // then
      assert.true(this.students[0].isSelected);
    });

    test('it should be possible to unselect a selected student', async function (assert) {
      // given
      this.set('students', [_buildSelectedStudent()]);
      const students = [_buildSelectedStudent()];
      students.meta = {
        page: 1,
        pageSize: 25,
        rowCount: 1,
        pageCount: 1,
      };
      this.set('students', students);

      const divisions = [
        { label: '3A', value: '3A' },
        { label: '3B', value: '3B' },
        { label: '3C', value: '3C' },
      ];
      this.set('divisions', divisions);

      await render(
        hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`
      );

      // when
      const firstStudentCheckbox = '.add-student-list__column-checkbox button:nth-of-type(1)';
      await click(firstStudentCheckbox);

      // then
      assert.false(this.students[0].isSelected);
    });

    [
      {
        testLabel: 'it should be possible to select all students when they are all unselected',
        students: [_buildUnselectedStudent(), _buildUnselectedStudent()],
      },
      {
        testLabel: 'it should be possible to select all students whether they are already selected or not',
        students: [_buildSelectedStudent(), _buildUnselectedStudent()],
      },
    ].forEach(({ testLabel, students }) => {
      test(testLabel, async function (assert) {
        // given
        students.meta = {
          page: 1,
          pageSize: 25,
          rowCount: 1,
          pageCount: 1,
        };
        this.set('students', students);
        const divisions = [
          { label: '3A', value: '3A' },
          { label: '3B', value: '3B' },
          { label: '3C', value: '3C' },
        ];
        this.set('divisions', divisions);

        await render(
          hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`
        );

        // when
        const selectAllCheckbox = '.add-student-list__checker';
        await click(selectAllCheckbox);

        // then
        assert.true(this.students.every((s) => s.isSelected));
      });
    });

    test('it should be possible to unselect all students when they are all selected', async function (assert) {
      // given
      const students = [_buildSelectedStudent(), _buildSelectedStudent()];
      students.meta = {
        page: 1,
        pageSize: 25,
        rowCount: 1,
        pageCount: 1,
      };
      this.set('students', students);
      const divisions = [
        { label: '3A', value: '3A' },
        { label: '3B', value: '3B' },
        { label: '3C', value: '3C' },
      ];
      this.set('divisions', divisions);

      await render(
        hbs`<AddStudentList @studentList={{this.students}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`
      );

      // when
      const selectAllCheckbox = '.add-student-list__checker';
      await click(selectAllCheckbox);

      // then
      assert.false(this.students.every((s) => s.isSelected));
    });

    module('sticky bar', () => {
      module('when there is no enrolled students (certification candidates)', () => {
        module('when there is no selected student', () => {
          test('should not show the sticky bar', async function (assert) {
            //given
            const birthdate = new Date('2018-01-12T09:29:16Z');
            const students = [
              _buildUnselectedStudent('Marie', 'Dupont', '3E', birthdate),
              _buildUnselectedStudent('Tom', 'Dupont', '4G', birthdate),
            ];
            students.meta = {
              page: 1,
              pageSize: 25,
              rowCount: 1,
              pageCount: 1,
            };
            this.set('students', students);
            this.set('session', _buildSession());
            this.set('returnToSessionCandidates', () => {});
            const divisions = [
              { label: '3A', value: '3A' },
              { label: '3B', value: '3B' },
              { label: '3C', value: '3C' },
            ];
            this.set('divisions', divisions);

            // when
            await render(hbs`<AddStudentList
              @studentList={{this.students}}
              @session={{this.session}}
              @certificationCenterDivisions={{this.divisions}}
              @returnToSessionCandidates={{this.returnToSessionCandidates}}>
            </AddStudentList>`);

            // then
            assert.dom('.add-student-list__bottom-action-bar').doesNotExist();
          });
        });

        module('when there are 2 selected students', () => {
          test('it should display a label accordingly', async function (assert) {
            // given
            const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
            const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';
            const birthdate = new Date('2018-01-12T09:29:16Z');
            const students = [
              _buildUnselectedStudent('Marie', 'Dupont', '3E', birthdate),
              _buildSelectedStudent('Tom', 'Dupont', '4G', birthdate),
              _buildSelectedStudent('Paul', 'Dupont', '4G', birthdate),
            ];
            sinon.stub(store, 'peekAll').withArgs('student').returns(students);
            students.meta = {
              page: 1,
              pageSize: 25,
              rowCount: 1,
              pageCount: 1,
            };
            this.set('students', students);
            this.set('session', _buildSession());
            this.set('returnToSessionCandidates', () => {});
            this.set('numberOfEnrolledStudents', 0);
            const divisions = [
              { label: '3A', value: '3A' },
              { label: '3B', value: '3B' },
              { label: '3C', value: '3C' },
            ];
            this.set('divisions', divisions);

            // when
            await render(hbs`<AddStudentList
              @studentList={{this.students}}
              @session={{this.session}}
              @certificationCenterDivisions={{this.divisions}}
              @returnToSessionCandidates={{this.returnToSessionCandidates}}
              @numberOfEnrolledStudents={{this.numberOfEnrolledStudents}}>
            </AddStudentList>`);

            // then
            assert.dom(candidatesEnrolledSelector).includesText('0 candidat(s) déjà inscrit(s) à la session');
            assert.dom(candidatesSelectedSelector).includesText('2 candidat(s) sélectionné(s)');
          });
        });
      });

      module('when there is already enrolled students (certification candidates), the sticky bar is shown', () => {
        module('when there is no additional selected student', function (hooks) {
          hooks.beforeEach(async function () {
            // given
            const birthdate = new Date('2018-01-12T09:29:16Z');
            const students = [
              _buildUnselectedStudent('Marie', 'Dupont', '3E', birthdate, true),
              _buildUnselectedStudent('Tom', 'Dupont', '4G', birthdate, true),
            ];
            sinon.stub(store, 'peekAll').withArgs('student').returns(students);
            students.meta = {
              page: 1,
              pageSize: 25,
              rowCount: 1,
              pageCount: 1,
            };
            this.set('students', students);
            this.set('session', _buildSession());
            this.set('returnToSessionCandidates', () => {});
            this.set('numberOfEnrolledStudents', 2);
            const divisions = [
              { label: '3A', value: '3A' },
              { label: '3B', value: '3B' },
              { label: '3C', value: '3C' },
            ];
            this.set('divisions', divisions);

            // when
            await render(hbs`<AddStudentList
              @studentList={{this.students}}
              @session={{this.session}}
              @certificationCenterDivisions={{this.divisions}}
              @returnToSessionCandidates={{this.returnToSessionCandidates}}
              @numberOfEnrolledStudents={{this.numberOfEnrolledStudents}}>
            </AddStudentList>`);
          });

          test('it should display a label accordingly', async function (assert) {
            // then
            const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
            const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';
            assert.dom(candidatesEnrolledSelector).includesText('2 candidat(s) déjà inscrit(s) à la session');
            assert.dom(candidatesSelectedSelector).includesText('Aucun candidat sélectionné');
          });

          test('it should disable the "Ajouter" button', async function (assert) {
            // then
            const addButtonDisabled = '.bottom-action-bar__actions--add-button.button--disabled';
            assert.dom(addButtonDisabled).exists();
          });
        });

        module('when there is additional selected student', function (hooks) {
          hooks.beforeEach(async function () {
            // given
            const birthdate = new Date('2018-01-12T09:29:16Z');
            const students = [
              _buildUnselectedStudent('Marie', 'Dupont', '3E', birthdate, true),
              _buildUnselectedStudent('Tom', 'Dupont', '4G', birthdate, true),
              _buildSelectedStudent('TomTom', 'Dupont', '4G', birthdate),
              _buildSelectedStudent('Marie-Jo', 'Dudu', '4G', birthdate),
            ];
            sinon.stub(store, 'peekAll').withArgs('student').returns(students);
            students.meta = {
              page: 1,
              pageSize: 25,
              rowCount: 1,
              pageCount: 1,
            };
            this.set('students', students);
            this.set('session', _buildSession());
            this.set('returnToSessionCandidates', () => {});
            this.set('numberOfEnrolledStudents', 2);
            const divisions = [
              { label: '3A', value: '3A' },
              { label: '3B', value: '3B' },
              { label: '3C', value: '3C' },
            ];
            this.set('divisions', divisions);

            // when
            await render(hbs`<AddStudentList
              @studentList={{this.students}}
              @session={{this.session}}
              @certificationCenterDivisions={{this.divisions}}
              @returnToSessionCandidates={{this.returnToSessionCandidates}}
              @numberOfEnrolledStudents={{this.numberOfEnrolledStudents}}>
            </AddStudentList>`);
          });

          test('it should display a label accordingly', async function (assert) {
            // then
            const candidatesEnrolledSelector = '.bottom-action-bar__informations--candidates-already-added';
            const candidatesSelectedSelector = '.bottom-action-bar__informations--candidates-selected';
            assert.dom(candidatesEnrolledSelector).includesText('2 candidat(s) déjà inscrit(s) à la session');
            assert.dom(candidatesSelectedSelector).includesText('2 candidat(s) sélectionné(s)');
          });

          test('it should show "Ajouter" button', async function (assert) {
            // then
            const addButtonDisabled = '.bottom-action-bar__actions--add-button.button--disabled';
            const addButton = ADD_BUTTON_SELECTOR;
            assert.dom(addButtonDisabled).doesNotExist();
            assert.dom(addButton).exists();
          });
        });
      });
    });

    module('when the server return an error on session save', function () {
      [400, 500].forEach(function (statusCode) {
        test(`it should notify a generic message for an error ${statusCode}`, async function (assert) {
          // given
          const ERROR_DETAIL = 'PAS BIEN';
          notificationMessagesService.error = sinon.spy();
          const error = _createError(statusCode, ERROR_DETAIL);
          const save = sinon.stub().rejects(error);

          const session = _buildSession({ save });
          this.set('session', session);
          const students = [_buildSelectedStudent()];
          students.meta = {
            page: 1,
            pageSize: 25,
            rowCount: 1,
            pageCount: 1,
          };
          this.set('students', students);
          sinon.stub(store, 'peekAll').withArgs('student').returns(students);

          await render(
            hbs`<AddStudentList @studentList={{this.students}} @session={{this.session}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`
          );

          // when
          const addButton = ADD_BUTTON_SELECTOR;
          await click(addButton);
          assert.ok(
            notificationMessagesService.error.calledOnceWith(
              'Une erreur est survenue au moment d‘inscrire les candidats...'
            )
          );
        });
      });

      test('it should notify a specific message for an unprocessable entity', async function (assert) {
        // given
        const ERROR_DETAIL = 'PAS BIEN';
        notificationMessagesService.error = sinon.spy();
        const unprocessableEntityError = _createError(422, ERROR_DETAIL);
        const save = sinon.stub();
        save.rejects(unprocessableEntityError);

        const session = _buildSession({ save });
        this.set('session', session);
        const students = [_buildSelectedStudent()];
        students.meta = {
          page: 1,
          pageSize: 25,
          rowCount: 1,
          pageCount: 1,
        };
        this.set('students', students);
        sinon.stub(store, 'peekAll').withArgs('student').returns(students);

        await render(
          hbs`<AddStudentList @studentList={{this.students}} @session={{this.session}} @certificationCenterDivisions={{this.divisions}}></AddStudentList>`
        );

        // when
        const addButton = ADD_BUTTON_SELECTOR;
        await click(addButton);
        assert.ok(notificationMessagesService.error.calledOnceWith(ERROR_DETAIL));
      });
    });
  });

  function _buildUnselectedStudent(
    firstName = 'firstName',
    lastName = 'lastName',
    division = 'division',
    birthdate = 'birthdate',
    isEnrolled = false
  ) {
    return EmberObject.create({
      firstName,
      lastName,
      division,
      birthdate,
      isSelected: false,
      isEnrolled,
      setSelected: function (newState) {
        if (this.isEnrolled) {
          return;
        }
        this.isSelected = newState;
      },
    });
  }

  function _buildSelectedStudent(
    firstName = 'firstName',
    lastName = 'lastName',
    division = 'division',
    birthdate = 'birthdate'
  ) {
    return EmberObject.create({
      firstName,
      lastName,
      division,
      birthdate,
      isSelected: true,
      isEnrolled: false,
      setSelected: function (newState) {
        if (this.isEnrolled) {
          return;
        }
        this.isSelected = newState;
      },
    });
  }

  function _buildSession({
    address = '13 rue des petits champs',
    accessCode = 'ABCDE',
    status = 'started',
    save = sinon.stub(),
  } = {}) {
    return EmberObject.create({
      address,
      accessCode,
      status,
      save,
    });
  }

  function _createError(status, ERROR_DETAIL) {
    return {
      errors: [{ status: status + '', title: 'Unauthorized', detail: ERROR_DETAIL }],
    };
  }
});
