import { getActiveFlashAssessmentConfiguration } from '../../../../../../src/certification/flash-certification/domain/usecases/get-active-flash-assessment-configuration.js';
import { domainBuilder, sinon, expect } from '../../../../../test-helper.js';

describe('#getActiveFlashAssessmentConfiguration', function () {
  it('should return the last configuration', async function () {
    // given
    const flashAlgorithmConfigurationRepository = {
      get: sinon.stub(),
    };

    const configuration = domainBuilder.buildFlashAlgorithmConfiguration();

    flashAlgorithmConfigurationRepository.get.resolves(configuration);

    // when
    const activeConfiguration = await getActiveFlashAssessmentConfiguration({ flashAlgorithmConfigurationRepository });

    // then
    expect(activeConfiguration).to.deep.equal(configuration);
  });
});
