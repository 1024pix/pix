import { getActiveFlashAssessmentConfiguration } from '../../../../../../src/certification/flash-certification/domain/usecases/get-active-flash-assessment-configuration.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('#getActiveFlashAssessmentConfiguration', function () {
  it('should return the last configuration', async function () {
    // given
    const configuration = domainBuilder.buildFlashAlgorithmConfiguration();
    const sharedFlashAlgorithmConfigurationRepository = {
      getMostRecent: sinon.stub().resolves(configuration),
    };

    // when
    const activeConfiguration = await getActiveFlashAssessmentConfiguration({
      sharedFlashAlgorithmConfigurationRepository,
    });

    // then
    expect(activeConfiguration).to.deep.equal(configuration);
  });
});
