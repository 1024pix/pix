import _ from 'lodash';

import { updateActiveFlashAssessmentConfiguration } from '../../../../../../src/certification/flash-certification/domain/usecases/update-active-flash-assessment-configuration.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | UseCases | update-active-flash-assessment-configuration', function () {
  it('should update the active flash assessment configuration', async function () {
    // given
    const flashAlgorithmConfigurationRepository = {
      getMostRecent: sinon.stub(),
      save: sinon.stub(),
    };

    const configuration = {
      warmUpLength: 12,
    };

    const previousConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
      warmUpLength: 10,
      variationPercent: 0.5,
    });

    flashAlgorithmConfigurationRepository.getMostRecent.resolves(previousConfiguration);

    // when
    await updateActiveFlashAssessmentConfiguration({
      flashAlgorithmConfigurationRepository,
      configuration,
    });

    // then
    const expectedConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
      ...previousConfiguration,
      ...configuration,
    });

    expect(flashAlgorithmConfigurationRepository.save).to.have.been.calledWith(
      sinon.match(_.omit(expectedConfiguration, 'createdAt')),
    );
  });
});
