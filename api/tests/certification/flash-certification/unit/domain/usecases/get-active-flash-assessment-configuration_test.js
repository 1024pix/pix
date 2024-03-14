import { getActiveFlashAssessmentConfiguration } from '../../../../../../src/certification/flash-certification/domain/usecases/get-active-flash-assessment-configuration.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('#getActiveFlashAssessmentConfiguration', function () {
  it('should return the last configuration', async function () {
    // given
    const flashAlgorithmConfigurationRepository = {
      getMostRecent: sinon.stub(),
    };

    const configuration = domainBuilder.buildFlashAlgorithmConfiguration();

    flashAlgorithmConfigurationRepository.getMostRecent.resolves(configuration);

    // when
    const activeConfiguration = await getActiveFlashAssessmentConfiguration({ flashAlgorithmConfigurationRepository });

    // then
    expect(activeConfiguration).to.deep.equal(configuration);
  });
});
