import { ConvertCenterToV3Job } from '../../../../../../src/certification/configuration/domain/models/ConvertCenterToV3Job.js';
import { findAndTriggerV2CenterToConvertInV3 } from '../../../../../../src/certification/configuration/domain/usecases/find-and-trigger-v2-center-to-convert-in-v3.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | find-and-trigger-v2-center-to-convert-in-v3', function () {
  let centersRepository, convertCenterToV3JobRepository;

  beforeEach(function () {
    centersRepository = {
      fetchSCOV2Centers: sinon.stub(),
    };
    convertCenterToV3JobRepository = {
      performAsync: sinon.stub(),
    };
  });

  it('should trigger V2 centers conversion to V3', async function () {
    // given
    const centerId = 1;
    centersRepository.fetchSCOV2Centers.resolves([centerId]);
    convertCenterToV3JobRepository.performAsync.resolves([centerId]);

    // when
    const results = await findAndTriggerV2CenterToConvertInV3({ centersRepository, convertCenterToV3JobRepository });

    // then
    expect(centersRepository.fetchSCOV2Centers).to.have.been.calledOnce;
    expect(convertCenterToV3JobRepository.performAsync).to.have.been.calledOnceWithExactly(
      new ConvertCenterToV3Job({ centerId }),
    );
    expect(results).to.deep.equal([centerId]);
  });
});
