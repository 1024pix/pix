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
        component.args.candidate = {
          subscription: null,
        };

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
        test('should redirect to certification starter', async function (assert) {
          // given
          const component = createGlimmerComponent('certification-instructions/steps');

          component.pageId = 2;
          component.pageCount = 2;
          component.isConfirmationCheckboxChecked = true;
          const transitionToStub = sinon.stub();
          const saveStub = sinon.stub();
          saveStub.resolves();
          component.router = {
            transitionTo: transitionToStub,
          };
          component.args.candidate = {
            save: saveStub,
            id: '123',
          };

          // when
          await component.nextStep();

          // then
          assert.ok(transitionToStub.calledWith('authenticated.certifications.start', '123'));
        });
      });
    });
  });

  module('#certificationName', function () {
    test('should return Pix when no complementary certification key', function (assert) {
      // given
      const component = createGlimmerComponent('certification-instructions/steps');
      component.args.candidate = {
        subscription: 'CORE',
      };

      // then
      assert.strictEqual(component.certificationName, 'Pix');
    });

    test('should return complementary certification name when has key', function (assert) {
      // given
      const component = createGlimmerComponent('certification-instructions/steps');
      component.args.candidate = {
        subscription: 'DROIT',
        hasNonCoreScopeSubscription: true,
      };

      // then
      assert.strictEqual(component.certificationName, 'Pix+ Droit');
    });

    test('should return Pix when has CLEA key', function (assert) {
      // given
      const component = createGlimmerComponent('certification-instructions/steps');
      component.args.candidate = {
        subscription: 'CLEA',
        hasNonCoreScopeSubscription: false,
      };

      // then
      assert.strictEqual(component.certificationName, 'Pix');
    });
  });

  module('#title', function () {
    test('should use Pix when CLEA complementary certification key', function (assert) {
      // given
      const component = createGlimmerComponent('certification-instructions/steps');
      component.args.candidate = {
        subscription: 'CLEA',
      };
      component.pageId = 1;

      // then
      assert.strictEqual(component.title, 'Bienvenue à la certification Pix');
    });
  });

  module('#certificationInstructionStep1Paragraph1', function () {
    test('should return default text when no complementary certification key', function (assert) {
      // given
      const component = createGlimmerComponent('certification-instructions/steps');
      component.args.candidate = {
        subscription: null,
      };

      // then
      assert.ok(
        component.certificationInstructionStep1Paragraph1
          .toString()
          .includes('ensemble des 16 compétences numériques du référentiel Pix'),
      );
    });

    test('should return default text when CLEA complementary certification key', function (assert) {
      // given
      const component = createGlimmerComponent('certification-instructions/steps');
      component.args.candidate = {
        subscription: 'CLEA',
      };

      // then
      assert.ok(
        component.certificationInstructionStep1Paragraph1
          .toString()
          .includes('ensemble des 16 compétences numériques du référentiel Pix'),
      );
    });

    test('should return Pix+ specific text when has complementary certification key', function (assert) {
      // given
      const component = createGlimmerComponent('certification-instructions/steps');
      component.args.candidate = {
        subscription: 'DROIT',
        hasNonCoreScopeSubscription: true,
      };

      // then
      assert.ok(
        component.certificationInstructionStep1Paragraph1
          .toString()
          .includes('ensemble des compétences du référentiel de certification Pix+ Droit'),
      );
    });
  });

  module('#durationLegend', function () {
    test('should return a formatted duration', function (assert) {
      // given
      const component = createGlimmerComponent('certification-instructions/steps');
      component.args.candidate = {
        subscription: null,
      };
      component.args.certificationInfo = {
        assessmentDuration: 155,
      };

      // then
      assert.strictEqual(component.durationLegend, '2 H 35 min');
    });
  });

  module('#durationText', function () {
    test('should return formatted duration', function (assert) {
      // given
      const component = createGlimmerComponent('certification-instructions/steps');
      component.args.candidate = {
        subscription: null,
      };
      component.args.certificationInfo = {
        assessmentDuration: 155,
      };

      // then
      assert.strictEqual(component.durationText, '2h35');
    });
  });
});
