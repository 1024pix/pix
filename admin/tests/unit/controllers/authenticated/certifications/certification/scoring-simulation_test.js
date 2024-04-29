import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/certifications/scoring-simulation', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('#checkFormValidity', function () {
    module('when score and capacity are filled', function () {
      test('it should set bothInputsFilledError to true', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/certifications/scoring-simulation');
        controller.score = 496;
        controller.capacity = 3;

        // when
        controller.checkFormValidity();

        // then
        assert.deepEqual(
          controller.errors[0],
          this.intl.t('pages.certifications.scoring-simulation.errors.both-input-filled'),
        );
      });
    });

    module('when score is above 896', function () {
      test('it should add a range error to errors', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/certifications/scoring-simulation');
        controller.score = 900;

        // when
        controller.checkFormValidity();

        // then
        assert.deepEqual(controller.errors[0], this.intl.t('pages.certifications.scoring-simulation.errors.score'));
      });
    });

    module('when score is below 0', function () {
      test('it should add a range error to errors', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/certifications/scoring-simulation');
        controller.score = -1;

        // when
        controller.checkFormValidity();

        // then
        assert.deepEqual(controller.errors[0], this.intl.t('pages.certifications.scoring-simulation.errors.score'));
      });
    });
  });

  module('#onGenerateSimulationProfile', function () {
    test('should call query record with correct parameters', function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certifications/scoring-simulation');
      const store = this.owner.lookup('service:store');
      const queryRecordStub = sinon.stub();
      store.queryRecord = queryRecordStub;
      const event = {
        preventDefault: () => {},
      };
      controller.score = 1;
      const query = { score: 1 };

      // when
      controller.onGenerateSimulationProfile(event);

      // then
      assert.ok(queryRecordStub.calledWith('scoring-and-capacity-simulator-report', query));
    });

    module('when an error occured', function () {
      test('should not query record method', function (assert) {
        // given
        const controller = this.owner.lookup('controller:authenticated/certifications/scoring-simulation');
        const store = this.owner.lookup('service:store');
        const queryRecordStub = sinon.stub();
        store.queryRecord = queryRecordStub;
        const event = {
          preventDefault: () => {},
        };
        controller.score = 1;
        controller.capacity = 1;

        // when
        controller.onGenerateSimulationProfile(event);

        // then
        sinon.assert.notCalled(queryRecordStub);
        assert.ok(true);
      });
    });
  });
});
