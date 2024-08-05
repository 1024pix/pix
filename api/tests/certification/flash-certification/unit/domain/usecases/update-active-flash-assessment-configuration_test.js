import _ from 'lodash';

import { createFlashAssessmentConfiguration } from '../../../../../../src/certification/flash-certification/domain/usecases/create-flash-assessment-configuration.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | UseCases | create-flash-assessment-configuration', function () {
  it('should create an active flash assessment configuration', async function () {
    // given
    const flashAlgorithmConfigurationRepository = {
      save: sinon.stub(),
    };
    const sharedFlashAlgorithmConfigurationRepository = {
      getMostRecent: sinon.stub(),
    };

    const configuration = {
      warmUpLength: 12,
    };

    const previousConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
      warmUpLength: 10,
      variationPercent: 0.5,
    });

    sharedFlashAlgorithmConfigurationRepository.getMostRecent.resolves(previousConfiguration);

    // when
    await createFlashAssessmentConfiguration({
      flashAlgorithmConfigurationRepository,
      sharedFlashAlgorithmConfigurationRepository,
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
