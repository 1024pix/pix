import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import sinon from 'sinon';
import times from 'lodash/times';

module('Unit | Component | add-student-list', function (hooks) {
  setupTest(hooks);

  let component;
  let store;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:add-student-list');
    store = this.owner.lookup('service:store');
  });

  module('#computed _hasCheckedSomething()', function () {
    test('it should be false if has no checked student', function (assert) {
      // given
      const studentList = [{ isSelected: false }, { isSelected: false }];
      component.args.studentList = studentList;

      // when
      const hasCheckedSomething = component._hasCheckedSomething();

      // then
      assert.false(hasCheckedSomething);
    });

    test('it should be true if at least one checked student', function (assert) {
      // given
      const studentList = [{ isSelected: false }, { isSelected: true }];
      component.args.studentList = studentList;

      // when
      const hasCheckedSomething = component._hasCheckedSomething();

      // then
      assert.true(hasCheckedSomething);
    });
  });

  module('#computed _hasCheckedEverything()', function () {
    test('it should be false if they are not all checked', function (assert) {
      // given
      const studentList = [{ isSelected: false }, { isSelected: true }];
      component.args.studentList = studentList;

      // when
      const hasCheckedEverything = component._hasCheckedEverything();

      // then
      assert.false(hasCheckedEverything);
    });

    test('it should be true if they are all checked', function (assert) {
      // given
      const studentList = [{ isSelected: true }, { isSelected: true }];
      component.args.studentList = studentList;

      // when
      const hasCheckedEverything = component._hasCheckedEverything();

      // then
      assert.true(hasCheckedEverything);
    });
  });

  module('#action toggleItem', function () {
    test('it should toggle the isSelected attribute of the student', function (assert) {
      // given
      const initialValue = true;
      const student = { isSelected: initialValue };

      // when
      component.toggleItem(student);

      // then

      assert.strictEqual(student.isSelected, !initialValue);
    });
  });

  module('#action enrolStudents', function () {
    test('it should save only selected students via the session', async function (assert) {
      // given
      const sessionId = 1;
      const unselectedStudents = times(3, () => {
        return { isSelected: false };
      });
      const selectedStudents = [{ isSelected: true }];
      component.args.studentList = [...unselectedStudents, ...selectedStudents];
      component.args.session = { id: sessionId, save: sinon.stub().resolves() };
      component.args.returnToSessionCandidates = sinon.spy();
      sinon.stub(store, 'peekAll').withArgs('student').returns(selectedStudents);

      // when
      await component.enrolStudents();

      // then
      sinon.assert.calledWith(component.args.session.save, {
        adapterOptions: { sessionId, studentListToAdd: selectedStudents },
      });
      sinon.assert.calledWith(component.args.returnToSessionCandidates, sessionId);
      assert.ok(component);
    });

    test('it should send error notification when save is not working', async function (assert) {
      // given
      const sessionId = 1;
      component.args.studentList = [{ isSelected: true }];
      component.args.session = { id: sessionId, save: sinon.stub().rejects() };
      component.notifications = { error: sinon.spy() };
      component.args.returnToSessionCandidates = sinon.spy();

      // when
      await component.enrolStudents();

      // then
      sinon.assert.calledOnce(component.notifications.error);
      sinon.assert.notCalled(component.args.returnToSessionCandidates);
      assert.ok(component);
    });
  });
});
