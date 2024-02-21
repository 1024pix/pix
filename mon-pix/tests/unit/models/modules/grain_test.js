import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module | Grain', function (hooks) {
  setupTest(hooks);

  module('#hasAnswerableElements', function () {
    module('when there are answerable elements in grain', function () {
      test('should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = { type: 'qcu', isAnswerable: true };
        const qcm = { type: 'qcm', isAnswerable: true };
        const qrocm = { type: 'qrocm', isAnswerable: true };
        const text = { type: 'text', isAnswerable: false };
        const grain = store.createRecord('grain', {
          rawElements: [qcu, qcm, qrocm, text],
        });

        // when
        const hasAnswerableElements = grain.hasAnswerableElements;

        // then
        assert.true(hasAnswerableElements);
      });
    });

    module('when there are no answerable element in grain', function () {
      test('should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text = { type: 'text', isAnswerable: false };
        const grain = store.createRecord('grain', {
          rawElements: [text],
        });

        // when
        const hasAnswerableElements = grain.hasAnswerableElements;

        // then
        assert.false(hasAnswerableElements);
      });
    });
  });

  module('#answerableElements', function () {
    module('when there are answerable elements in elements', function () {
      test('should return only answerable elements', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = { type: 'qcu', isAnswerable: true };
        const qcm = { type: 'qcm', isAnswerable: true };
        const qrocm = { type: 'qrocm', isAnswerable: true };
        const text = { type: 'text', isAnswerable: false };
        const grain = store.createRecord('grain', {
          rawElements: [qcu, qcm, qrocm, text],
        });

        // when
        const answerableElements = grain.answerableElements;

        // then
        assert.strictEqual(answerableElements.length, 3);
        assert.deepEqual(answerableElements, [qcu, qcm, qrocm]);
      });
    });

    module('when there are no answerable elements in elements', function () {
      test('should return an empty array', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const text = { type: 'text' };
        const grain = store.createRecord('grain', {
          rawElements: [text],
        });

        // when
        const answerableElements = grain.answerableElements;

        // then
        assert.strictEqual(answerableElements.length, 0);
      });
    });
  });

  module('#allElementsAreAnsweredForPassage', function () {
    module('when all answerable elements are answered', function () {
      test('should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = { id: 'qcu-id-1', type: 'qcu' };
        const elementAnswer = store.createRecord('element-answer', {
          elementId: qcu.id,
        });
        const passage = store.createRecord('passage', {
          elementAnswers: [elementAnswer],
        });
        const grain = store.createRecord('grain', {
          rawElements: [qcu],
        });

        // when
        const allElementsAreAnswered = grain.allElementsAreAnsweredForPassage(passage);

        // then
        assert.true(allElementsAreAnswered);
      });
    });

    module('when all answerable elements are not answered', function () {
      test('should return false', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = { type: 'qcu', isAnswerable: true };
        const grain = store.createRecord('grain', {
          rawElements: [qcu],
        });
        const passage = store.createRecord('passage');

        // when
        const allElementsAreAnswered = grain.allElementsAreAnsweredForPassage(passage);

        // then
        assert.false(allElementsAreAnswered);
      });
    });
  });
});
