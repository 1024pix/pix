import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Module | QROCM', function (hooks) {
  setupTest(hooks);

  module('#answerIsValid', function () {
    module('When correction status is ko', function () {
      test('should be error', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const correctionResponse = store.createRecord('correction-response', { status: 'ko' });
        const qrocmElement = { id: '994b6a96-a3c2-47ae-a461-87548ac6e02b' };
        store.createRecord('element-answer', {
          correction: correctionResponse,
          element: qrocmElement,
        });
        const component = createGlimmerComponent('module/element/qrocm', {
          qrocm: qrocmElement,
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
        const qrocmElement = { id: 'qrocm-id' };
        store.createRecord('element-answer', {
          correction: correctionResponse,
          elementId: qrocmElement.id,
        });
        const component = createGlimmerComponent('module/element/qrocm', {
          qrocm: qrocmElement,
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
