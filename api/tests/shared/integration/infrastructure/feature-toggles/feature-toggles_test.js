import { config } from '../../../../../src/shared/config.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('FeatureToggles', function () {
  context('#getBooleanValue', function () {
    it('get boolean value when flagKey exists', async function () {
      sinon.stub(config, 'featureToggles').value({ testTrueBooleanValue: true, testFalseBooleanValue: false });

      const enabledFeature = await featureToggles.getBooleanValue('testTrueBooleanValue');
      const disabledFeature = await featureToggles.getBooleanValue('testFalseBooleanValue');

      expect(enabledFeature).to.equal(true);
      expect(disabledFeature).to.equal(false);
    });

    it('get false value when flagKey does not exist', async function () {
      sinon.stub(config, 'featureToggles').value({ existingKey: true });

      const nonExistingFeature = await featureToggles.getBooleanValue('nonExistingKey');

      expect(nonExistingFeature).to.equal(false);
    });
  });

  context('#getStringValue', function () {
    it('is not implemented', async function () {
      sinon.stub(config, 'featureToggles').value({ stringValue: 'hello' });

      const notImplemented = await featureToggles.getStringValue('stringValue');
      expect(notImplemented).to.be.undefined;
    });
  });
});
