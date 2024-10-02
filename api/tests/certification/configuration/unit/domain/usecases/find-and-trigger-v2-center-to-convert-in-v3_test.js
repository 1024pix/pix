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
    centerRepository.findSCOV2Centers.onCall(0).returns([centerId1]);
    centerRepository.findSCOV2Centers.onCall(1).returns([centerId2]);
    centerRepository.findSCOV2Centers.onCall(2).returns([]);

    convertCenterToV3JobRepository.performAsync.resolves();

    // when
    const numberOfCenters = await findAndTriggerV2CenterToConvertInV3({
      centerRepository,
      convertCenterToV3JobRepository,
    });

    // then
    expect(centerRepository.findSCOV2Centers).to.have.been.calledThrice;
    expect(centerRepository.findSCOV2Centers.getCall(0).args).to.deep.equal([{ cursorId: undefined }]);
    expect(centerRepository.findSCOV2Centers.getCall(1).args).to.deep.equal([{ cursorId: centerId1 }]);
    expect(centerRepository.findSCOV2Centers.getCall(2).args).to.deep.equal([{ cursorId: centerId2 }]);
    expect(convertCenterToV3JobRepository.performAsync.getCall(0).args).to.deep.equal([
      new ConvertCenterToV3Job({ centerId: centerId1 }),
    ]);
    expect(convertCenterToV3JobRepository.performAsync.getCall(1).args).to.deep.equal([
      new ConvertCenterToV3Job({ centerId: centerId2 }),
    ]);
    expect(numberOfCenters).to.equal(2);
  });

  describe('when is a dry run', function () {
    it('should not trigger conversion orders', async function () {
      // given
      const centerId1 = 1;
      centerRepository.findSCOV2Centers.onCall(0).returns([centerId1]);

      centerRepository.findSCOV2Centers.onCall(1).returns([]);

      // when
      const numberOfCenters = await findAndTriggerV2CenterToConvertInV3({
        isDryRun: true,
        centerRepository,
        convertCenterToV3JobRepository,
      });

      // then
      expect(centerRepository.findSCOV2Centers).to.have.been.calledTwice;
      expect(convertCenterToV3JobRepository.performAsync).to.not.have.been.called;
      expect(numberOfCenters).to.equal(1);
    });
  });
});
