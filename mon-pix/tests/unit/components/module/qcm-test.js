import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Module | QCM', function (hooks) {
  setupTest(hooks);

  module('#answerIsValid', function () {
    module('When correction status is ko', function () {
      test('should be error', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const correctionResponse = store.createRecord('correction-response', { status: 'ko' });
        const qcmElement = { id: '994b6a96-a3c2-47ae-a461-87548ac6e02b' };
        store.createRecord('element-answer', {
          correction: correctionResponse,
          element: qcmElement,
        });
        const component = createGlimmerComponent('module/element/qcm', {
          qcm: qcmElement,
          correction: correctionResponse,
        });

        // when
        const answerIsValid = component.answerIsValid;

        // then
        assert.false(answerIsValid);
      });
    });

    module('When correction status is ok', function () {
      test('should be success', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const correctionResponse = store.createRecord('correction-response', { status: 'ok' });
        const qcmElement = { id: 'qcm-id' };
        store.createRecord('element-answer', {
          correction: correctionResponse,
          elementId: qcmElement.id,
        });
        const component = createGlimmerComponent('module/element/qcm', {
          qcm: qcmElement,
          correction: correctionResponse,
        });

        // when
        const answerIsValid = component.answerIsValid;

        // then
        assert.true(answerIsValid);
      });
    });
  });
});
