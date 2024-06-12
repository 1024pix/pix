import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Unit | Component | certification-instruction | steps', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#nextStep', function () {
    module('when pageId is lower than pageCount', function () {
      test('should change the pageId', async function (assert) {
        // given
        const component = createGlimmerComponent('certification-instructions/steps');

        component.pageId = 1;
        component.pageCount = 2;
        component.isConfirmationCheckboxChecked = false;

        // when
        await component.nextStep();

        // then
        assert.strictEqual(component.pageId, 2);
      });
    });

    module('when pageId equal pageCount', function () {
      module('when confirmation checkbox is checked', function () {
        test('should redirect to certificartion starter', async function (assert) {
          // given
          const component = createGlimmerComponent('certification-instructions/steps');

          component.pageId = 2;
          component.pageCount = 2;
          component.args = {
            candidateId: 123,
          };
          component.isConfirmationCheckboxChecked = true;
          const transitionToStub = sinon.stub();
          component.router = {
            transitionTo: transitionToStub,
          };

          // when
          await component.nextStep();

          // then
          assert.ok(
            transitionToStub.calledWith('authenticated.certifications.start', 123, {
              queryParams: {
                isConfirmationCheckboxChecked: true,
              },
            }),
          );
        });
      });
    });
  });
});
