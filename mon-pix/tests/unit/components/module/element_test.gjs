import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Module | Element', function (hooks) {
  setupTest(hooks);

  module('#getLastCorrectionForElement', function () {
    test('should call parent getLastCorrectionForElement', async function (assert) {
      // given
      const element = {
        id: 'd0690f26-978c-41c3-9a21-da931857739c',
        instruction: 'Instruction',
        proposals: [
          { id: '1', content: 'radio1' },
          { id: '2', content: 'radio2' },
        ],
        type: 'qcu',
      };
      const getLastCorrectionForElementStub = sinon.stub();
      getLastCorrectionForElementStub.withArgs(element).returns('expectedLastCorrectionForElement');
      const component = createGlimmerComponent('module/element', {
        getLastCorrectionForElement: getLastCorrectionForElementStub,
        element,
      });

      // when
      const lastCorrectionForElement = component.getLastCorrectionForElement(element);

      // then
      assert.deepEqual(lastCorrectionForElement, 'expectedLastCorrectionForElement');
    });
  });
});
