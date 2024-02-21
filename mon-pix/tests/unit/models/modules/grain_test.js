import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module | Grain', function (hooks) {
  setupTest(hooks);

  module('#hasAnswerableElements', function () {
    module('when there are answerable elements in grain', function () {
      test('should return true', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const qcu = store.createRecord('qcu', { type: 'qcus', isAnswerable: true });
        const qcm = store.createRecord('qcm', { type: 'qcms', isAnswerable: true });
        const qrocm = store.createRecord('qrocm', { type: 'qrocms', isAnswerable: true });
        const text = store.createRecord('text', { type: 'texts', isAnswerable: false });
        const grain = store.createRecord('grain', {
          elements: [qcu, qcm, qrocm, text],
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
        const text = store.createRecord('text', { type: 'texts', isAnswerable: false });
        const grain = store.createRecord('grain', {
          elements: [text],
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
        const qcu = store.createRecord('qcu', { type: 'qcus', isAnswerable: true });
        const qcm = store.createRecord('qcm', { type: 'qcms', isAnswerable: true });
        const qrocm = store.createRecord('qrocm', { type: 'qrocms', isAnswerable: true });
        const text = store.createRecord('text', { type: 'texts', isAnswerable: false });
        const grain = store.createRecord('grain', {
          elements: [qcu, qcm, qrocm, text],
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
        const text = store.createRecord('text', { type: 'texts' });
        const grain = store.createRecord('grain', {
          elements: [text],
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
        const qcu = store.createRecord('qcu', { type: 'qcus' });
        const elementAnswer = store.createRecord('element-answer', {
          elementId: qcu.id,
        });
        const passage = store.createRecord('passage', {
          elementAnswers: [elementAnswer],
        });
        const grain = store.createRecord('grain', {
          elements: [qcu],
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
        const qcu = store.createRecord('qcu', { type: 'qcus', isAnswerable: true });
        const grain = store.createRecord('grain', {
          elements: [qcu],
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
