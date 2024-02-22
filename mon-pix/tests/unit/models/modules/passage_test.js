import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module | Passage', function (hooks) {
  setupTest(hooks);

  module('#getLastCorrectionForElement', function () {
    module('when the element has been answered', function () {
      test('should return the element correction', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcuElement = {
          id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
          instruction: 'Instruction',
          proposals: [
            { id: '1', content: 'radio1' },
            { id: '2', content: 'radio2' },
          ],
          type: 'qcus',
        };
        const expectedCorrection = store.createRecord('correction-response', {
          feedback: 'Too Bad!',
          status: 'ko',
          solution: 'solution',
        });
        const elementAnswer = store.createRecord('element-answer', {
          correction: expectedCorrection,
          elementId: qcuElement.id,
        });
        const passage = store.createRecord('passage', { moduleId: '234', elementAnswers: [elementAnswer] });

        // when
        const correction = passage.getLastCorrectionForElement(qcuElement);

        // then
        assert.strictEqual(correction, expectedCorrection);
      });
    });

    module('when the element has never been answered', function () {
      test('should return undefined', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const passage = store.createRecord('passage', { moduleId: '234' });
        const qcuElement = {
          id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
          instruction: 'Instruction',
          proposals: [
            { id: '1', content: 'radio1' },
            { id: '2', content: 'radio2' },
          ],
          type: 'qcu',
        };

        // when
        const correction = passage.getLastCorrectionForElement(qcuElement);

        // then
        assert.strictEqual(correction, undefined);
      });
    });
  });
});
