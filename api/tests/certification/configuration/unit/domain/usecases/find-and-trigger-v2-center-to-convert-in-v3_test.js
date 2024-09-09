import { ConvertCenterToV3Job } from '../../../../../../src/certification/configuration/domain/models/ConvertCenterToV3Job.js';
import { findAndTriggerV2CenterToConvertInV3 } from '../../../../../../src/certification/configuration/domain/usecases/find-and-trigger-v2-center-to-convert-in-v3.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | find-and-trigger-v2-center-to-convert-in-v3', function () {
  let centerRepository, convertCenterToV3JobRepository;

  beforeEach(function () {
    centerRepository = {
      findSCOV2Centers: sinon.stub(),
    };
    convertCenterToV3JobRepository = {
      performAsync: sinon.stub(),
    };
  });

  it('should trigger V2 centers conversion to V3', async function () {
    // given
    const centerId1 = 1;
    const centerId2 = 2;
    centerRepository.fetchSCOV2Centers.resolves([centerId1]);
    centerRepository.fetchSCOV2Centers.onCall(0).returns({
      centerIds: [centerId1],
      pagination: {
        page: 1,
        pageCount: 2,
        pageSize: 1,
        rowCount: 2,
      },
    });
    centerRepository.findSCOV2Centers.onCall(1).returns({
      centerIds: [centerId2],
      pagination: {
        page: 2,
        pageCount: 2,
        pageSize: 1,
        rowCount: 2,
      },
    });
    centerRepository.findSCOV2Centers.onCall(2).returns({
      centerIds: [],
      pagination: {
        page: 3,
        pageCount: 2,
        pageSize: 1,
        rowCount: 2,
      },
    });

    convertCenterToV3JobRepository.performAsync.resolves();

    // when
    const numberOfCenters = await findAndTriggerV2CenterToConvertInV3({
      centerRepository,
      convertCenterToV3JobRepository,
    });

    // then
    expect(centerRepository.findSCOV2Centers).to.have.been.calledThrice;
    expect(convertCenterToV3JobRepository.performAsync.getCall(0).args).to.deep.equal([
      new ConvertCenterToV3Job({ centerId: centerId1 }),
    ]);
    expect(convertCenterToV3JobRepository.performAsync.getCall(1).args).to.deep.equal([
      new ConvertCenterToV3Job({ centerId: centerId2 }),
    ]);
    expect(numberOfCenters).to.equal(2);
  });
});
