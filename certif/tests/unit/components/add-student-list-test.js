import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ArrayProxy from '@ember/array/proxy';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | add-student-list', function(hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:add-student-list');
  });

  module('#computed hasCheckedSomething', function() {

    test('it should be false if has no checked student', function(assert) {
      // given
      const studentList = ArrayProxy.create({
        content: [
          { isSelected: false },
          { isSelected: false },
        ],
      });
      component.args.studentList = studentList;

      // when
      const hasCheckedSomething = component.hasCheckedSomething;

      // then
      assert.equal(hasCheckedSomething, false);
    });

    test('it should be true if at least one checked student', function(assert) {
      // given
      const studentList = ArrayProxy.create({
        content: [
          { isSelected: false },
          { isSelected: true },
        ],
      });
      component.args.studentList = studentList;

      // when
      const hasCheckedSomething = component.hasCheckedSomething;

      // then
      assert.equal(hasCheckedSomething, true);
    });
  });

  module('#computed hasCheckedEverything', function() {

    test('it should be false if they are not all checked', function(assert) {
      // given
      const studentList = ArrayProxy.create({
        content: [
          { isSelected: false },
          { isSelected: true },
        ],
      });
      component.args.studentList = studentList;

      // when
      const hasCheckedEverything = component.hasCheckedEverything;

      // then
      assert.equal(hasCheckedEverything, false);
    });

    test('it should be true if they are all checked', function(assert) {
      // given
      const studentList = ArrayProxy.create({
        content: [
          { isSelected: true },
          { isSelected: true },
        ],
      });
      component.args.studentList = studentList;

      // when
      const hasCheckedEverything = component.hasCheckedEverything;

      // then
      assert.equal(hasCheckedEverything, true);
    });
  });

  module('#action toggleItem', function() {

    test('it should toggle the isSelected attribute of the student', function(assert) {
      // given
      const initialValue = true;
      const student = { isSelected: initialValue };

      // when
      component.toggleItem(student);

      // then
      assert.equal(student.isSelected, !initialValue);
    });
  });

  module('#action toggleAllItems', function() {
    [
      { isSelected1: true, isSelected2: true, expectedState: false },
      { isSelected1: true, isSelected2: false, expectedState: false },
      { isSelected1: false, isSelected2: true, expectedState: false },
      { isSelected1: false, isSelected2: false, expectedState: true },
    ].forEach(({ isSelected1, isSelected2, expectedState }) =>
      test('it should toggle the isSelected attribute of all the student depending on if some were checked', function(assert) {
      // given
        const studentList = ArrayProxy.create({
          content: [
            { isSelected: isSelected1 },
            { isSelected: isSelected2 },
          ],
        });
        component.args.studentList = studentList;

        // when
        component.toggleAllItems();

        // then
        component.args.studentList.content.forEach((student) => {
          assert.equal(student.isSelected, expectedState);
        });
      }),
    );
  });
});
