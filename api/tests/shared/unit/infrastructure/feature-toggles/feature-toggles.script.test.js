import sinon from 'sinon';

import { FeatureToggleScript } from '../../../../../src/shared/infrastructure/feature-toggles/feature-toggles-script.js';

describe('Unit | Shared | Scripts | FeatureToggleScript', function () {
  let script;
  let featureTogglesClient;
  let logger;

  beforeEach(function () {
    script = new FeatureToggleScript();
    featureTogglesClient = {
      config: {},
      set: sinon.stub(),
      get: sinon.stub(),
    };
    logger = {
      warn: sinon.stub(),
    };
  });

  describe('#handle', function () {
    context('when featureToggle.type is boolean', function () {
      context('when the value is the string "true"', function () {
        it('sets boolean true in the featureTogglesClient', async function () {
          // given
          sinon.stub(featureTogglesClient, 'config').value({ aFeatureToggle: { type: 'boolean' } });
          const options = { key: 'aFeatureToggle', value: 'true' };

          // when
          await script.handle({ options, logger, featureTogglesClient });

          // then
          expect(featureTogglesClient.set).to.have.been.calledOnceWithExactly('aFeatureToggle', true);
        });
      });

      context('when the value is the string "false"', function () {
        it('sets boolean false in the featureTogglesClient', async function () {
          // given
          sinon.stub(featureTogglesClient, 'config').value({ aFeatureToggle: { type: 'boolean' } });
          const options = { key: 'aFeatureToggle', value: 'false' };

          // when
          await script.handle({ options, logger, featureTogglesClient });

          // then
          expect(featureTogglesClient.set).to.have.been.calledOnceWithExactly('aFeatureToggle', false);
        });
      });
    });

    context('when featureToggle.type is number', function () {
      it('sets an empty list in the featureTogglesClient', async function () {
        // given
        sinon.stub(featureTogglesClient, 'config').value({ aFeatureToggle: { type: 'number' } });
        const options = { key: 'aFeatureToggle', value: '98765' };

        // when
        await script.handle({ options, logger, featureTogglesClient });

        // then
        expect(featureTogglesClient.set).to.have.been.calledOnceWithExactly('aFeatureToggle', 98765);
      });
    });

    context('when featureToggle.type is array', function () {
      context('when the value is an empty string', function () {
        it('sets an empty list in the featureTogglesClient', async function () {
          // given
          sinon.stub(featureTogglesClient, 'config').value({ aFeatureToggle: { type: 'array' } });
          const options = { key: 'aFeatureToggle', value: '' };

          // when
          await script.handle({ options, logger, featureTogglesClient });

          // then
          expect(featureTogglesClient.set).to.have.been.calledOnceWithExactly('aFeatureToggle', []);
        });
      });

      context('when disabledLocalesInFrontend value is a comma-separated list of values', function () {
        it('sets a populated list in the featureTogglesClient', async function () {
          // given
          sinon.stub(featureTogglesClient, 'config').value({ aFeatureToggle: { type: 'array' } });
          const options = { key: 'aFeatureToggle', value: 'value1,value2' };

          // when
          await script.handle({ options, logger, featureTogglesClient });

          // then
          expect(featureTogglesClient.set).to.have.been.calledOnceWithExactly('aFeatureToggle', ['value1', 'value2']);
        });
      });
    });
  });
});
