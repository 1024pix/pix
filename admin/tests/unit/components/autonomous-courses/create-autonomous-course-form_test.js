import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Autonomous courses | CreateAutonomousCourseForm', function (hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function () {
    component = createComponent('component:autonomous-courses/create-autonomous-course-form', {
      onSubmit: sinon.stub(),
      autonomousCourse: {
        internalTitle: '',
        publicTitle: '',
        targetProfileId: '',
        customLandingPageText: '',
      },
    });
  });

  module('#updateAutonomousCourseValue', function () {
    test('it should update appropriate form attribute', function (assert) {
      // given
      const keyToUpdate = 'internalTitle';
      const formEvent = { target: { value: 'New Title' } };

      // when
      component.updateAutonomousCourseValue(keyToUpdate, formEvent);

      // then
      assert.strictEqual(component.args.autonomousCourse.internalTitle, 'New Title');
    });
  });

  module('#selectTargetProfile', function () {
    test('it should update target profile attribute', function (assert) {
      // given
      const targetProfileId = 32;

      // when
      component.selectTargetProfile(targetProfileId);

      // then
      assert.strictEqual(component.args.autonomousCourse.targetProfileId, 32);
    });
  });

  module('#onSubmit', function () {
    let submitEvent;

    test('is should call the onSubmit method', async function (assert) {
      // when
      await component.onSubmit(submitEvent);

      // then
      assert.ok(component.args.onSubmit.called);
    });
  });
});
