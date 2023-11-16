import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Module | Controller | get', function (hooks) {
  setupTest(hooks);

  module('#action submitAnswer', function () {
    test('it should use the store and save the element answer', async function (assert) {
      // given
      const expectedCorrection = 'correction';
      const userResponse = 'userResponse';
      const elementId = 'elementId';
      const moduleSlug = 'moduleSlug';

      const answerData = {
        userResponse,
        elementId,
        moduleSlug,
      };

      const controller = this.owner.lookup('controller:module/get');
      controller.model = {
        id: moduleSlug,
      };
      controller.store = {
        createRecord: sinon.stub(),
      };
      const saveStub = sinon.stub();

      controller.store.createRecord
        .withArgs('element-answer', {
          userResponse,
        })
        .returns({
          save: saveStub,
        });

      saveStub
        .withArgs({
          adapterOptions: {
            elementId: answerData.elementId,
            moduleSlug: moduleSlug,
          },
        })
        .resolves({ correction: expectedCorrection });

      // when
      await controller.submitAnswer(answerData);

      // then
      assert.strictEqual(controller.correctionResponse[elementId], expectedCorrection);
    });
  });
});
