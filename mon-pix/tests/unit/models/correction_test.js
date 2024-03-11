import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | correction', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('exists', function (assert) {
    const model = store.createRecord('correction');
    assert.ok(model);
  });

  module('#noHintsNorTutorialsAtAll', function () {
    let model;
    const defaultAttributes = {
      solution: 'a fake solution',
      hint: null,
      tutorials: [],
      learningMoreTutorials: [],
    };

    test('should be true when correction has only solution', function (assert) {
      // given
      model = store.createRecord('correction', defaultAttributes);

      // when
      const result = model.noHintsNorTutorialsAtAll;

      // then
      assert.true(result);
    });

    test('should be false when correction has an hint', function (assert) {
      // given
      model = store.createRecord(
        'correction',
        Object.assign({}, defaultAttributes, {
          hint: 'a fake hint',
        }),
      );

      // when
      const result = model.noHintsNorTutorialsAtAll;

      // then
      assert.false(result);
    });

    test('should be false when correction has a tutorial', function (assert) {
      // given
      const givenTutorial = store.createRecord('tutorial', { title: 'is a fake tutorial' });
      model = store.createRecord(
        'correction',
        Object.assign({}, defaultAttributes, {
          tutorials: [givenTutorial],
        }),
      );

      // when
      const result = model.noHintsNorTutorialsAtAll;

      // then
      assert.false(result);
    });

    test('should be false when correction has a learningMoreTutorial', function (assert) {
      // given
      const givenTutorial = store.createRecord('tutorial', { title: 'is a fake tutorial' });
      model = store.createRecord(
        'correction',
        Object.assign({}, defaultAttributes, {
          learningMoreTutorials: [givenTutorial],
        }),
      );

      // when
      const result = model.noHintsNorTutorialsAtAll;

      // then
      assert.false(result);
    });
  });
});
