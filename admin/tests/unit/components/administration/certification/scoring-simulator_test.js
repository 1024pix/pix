import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Unit | Component | authenticated/certifications/scoring-simulator', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#checkFormValidity', function () {
    module('when score and capacity are filled', function () {
      test('it should set bothInputsFilledError to true', function (assert) {
        // given
        const component = createGlimmerComponent('component:administration/certification/scoring-simulator');
        component.score = 496;
        component.capacity = 3;

        // when
        component.checkFormValidity();

        // then
        assert.deepEqual(
          component.errors[0],
          'Merci de ne renseigner que l’un des champs “Score global en Pix” ou “Capacité”',
        );
      });
    });

    module('when score is above 896', function () {
      test('it should add a range error to errors', function (assert) {
        // given
        const component = createGlimmerComponent('component:administration/certification/scoring-simulator');
        component.score = 900;

        // when
        component.checkFormValidity();

        // then
        assert.deepEqual(component.errors[0], 'Merci d’indiquer un score en Pix compris entre O et 896');
      });
    });

    module('when score is below 0', function () {
      test('it should add a range error to errors', function (assert) {
        // given
        const component = createGlimmerComponent('component:administration/certification/scoring-simulator');
        component.score = -1;

        // when
        component.checkFormValidity();

        // then
        assert.deepEqual(component.errors[0], 'Merci d’indiquer un score en Pix compris entre O et 896');
      });
    });
  });

  module('#onGenerateSimulatorProfile', function () {
    test('should call getSimulatorResult method with correct parameters', function (assert) {
      // given
      const component = createGlimmerComponent('component:administration/certification/scoring-simulator');
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('scoring-and-capacity-simulator-report');
      const getSimulatorResultStub = sinon.stub(adapter, 'getSimulatorResult');
      const event = {
        preventDefault: () => {},
      };
      component.score = 1;

      // when
      component.onGenerateSimulatorProfile(event);

      // then
      sinon.assert.calledWithExactly(getSimulatorResultStub, { score: 1, capacity: null });
      assert.ok(true);
    });

    module('when an error occured', function () {
      test('should not call getSimulatorResult method', function (assert) {
        // given
        const component = createGlimmerComponent('component:administration/certification/scoring-simulator');
        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('scoring-and-capacity-simulator-report');
        const getSimulatorResultStub = sinon.stub(adapter, 'getSimulatorResult');
        const event = {
          preventDefault: () => {},
        };
        component.score = 1;
        component.capacity = 1;

        // when
        component.onGenerateSimulatorProfile(event);

        // then
        sinon.assert.notCalled(getSimulatorResultStub);
        assert.ok(true);
      });
    });
  });
});
