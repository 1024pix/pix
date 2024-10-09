import { CenterTypes } from '../../../../../../src/certification/configuration/domain/models/CenterTypes.js';
import { ConvertCenterToV3Job } from '../../../../../../src/certification/configuration/domain/models/ConvertCenterToV3Job.js';
import { findAndTriggerV2CenterToConvertInV3 } from '../../../../../../src/certification/configuration/domain/usecases/find-and-trigger-v2-center-to-convert-in-v3.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

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
    const center1 = domainBuilder.certification.configuration.buildCenter({ id: 1, type: CenterTypes.SCO });
    const center2 = domainBuilder.certification.configuration.buildCenter({ id: 2, type: CenterTypes.SCO });
    centerRepository.findSCOV2Centers.onCall(0).returns([center1]);
    centerRepository.findSCOV2Centers.onCall(1).returns([center2]);
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
    expect(centerRepository.findSCOV2Centers.getCall(1).args).to.deep.equal([{ cursorId: center1.id }]);
    expect(centerRepository.findSCOV2Centers.getCall(2).args).to.deep.equal([{ cursorId: center2.id }]);
    expect(convertCenterToV3JobRepository.performAsync.getCall(0).args).to.deep.equal([
      new ConvertCenterToV3Job({ centerId: center1.id }),
    ]);
    expect(convertCenterToV3JobRepository.performAsync.getCall(1).args).to.deep.equal([
      new ConvertCenterToV3Job({ centerId: center2.id }),
    ]);
    expect(numberOfCenters).to.equal(2);
  });

  describe('when is a dry run', function () {
    it('should not trigger conversion orders', async function () {
      // given
      const center1 = domainBuilder.certification.configuration.buildCenter({ id: 1, type: CenterTypes.SCO });
      centerRepository.findSCOV2Centers.onCall(0).returns([center1]);
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
