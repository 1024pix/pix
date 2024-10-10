import { CenterTypes } from '../../../../../../src/certification/configuration/domain/models/CenterTypes.js';
import { ConvertScoCenterToV3Job } from '../../../../../../src/certification/configuration/domain/models/ConvertScoCenterToV3Job.js';
import { findAndTriggerV2CenterToConvertInV3 } from '../../../../../../src/certification/configuration/domain/usecases/find-and-trigger-v2-sco-center-to-convert-in-v3.js';
import { config } from '../../../../../../src/shared/config.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | find-and-trigger-v2-sco-center-to-convert-in-v3', function () {
  let centerRepository, convertScoCenterToV3JobRepository, originalEnvValueWhitelist;

  beforeEach(function () {
    originalEnvValueWhitelist = config.features.pixCertifScoBlockedAccessWhitelist;
    config.features.pixCertifScoBlockedAccessWhitelist = [];

    centerRepository = {
      findSCOV2Centers: sinon.stub(),
    };
    convertScoCenterToV3JobRepository = {
      performAsync: sinon.stub(),
    };
  });

  afterEach(function () {
    config.features.pixCertifScoBlockedAccessWhitelist = originalEnvValueWhitelist;
  });

  it('should trigger V2 centers conversion to V3', async function () {
    // given
    const center1 = domainBuilder.certification.configuration.buildCenter({
      id: 1,
      type: CenterTypes.SCO,
      externalId: 'center1',
    });
    const center2 = domainBuilder.certification.configuration.buildCenter({
      id: 2,
      type: CenterTypes.SCO,
      externalId: 'center2',
    });
    centerRepository.findSCOV2Centers.onCall(0).returns([center1]);
    centerRepository.findSCOV2Centers.onCall(1).returns([center2]);
    centerRepository.findSCOV2Centers.onCall(2).returns([]);

    convertScoCenterToV3JobRepository.performAsync.resolves();

    // when
    const numberOfCenters = await findAndTriggerV2CenterToConvertInV3({
      centerRepository,
      convertScoCenterToV3JobRepository,
    });

    // then
    expect(centerRepository.findSCOV2Centers).to.have.been.calledThrice;
    expect(centerRepository.findSCOV2Centers.getCall(0).args).to.deep.equal([{ cursorId: undefined }]);
    expect(centerRepository.findSCOV2Centers.getCall(1).args).to.deep.equal([{ cursorId: center1.id }]);
    expect(centerRepository.findSCOV2Centers.getCall(2).args).to.deep.equal([{ cursorId: center2.id }]);
    expect(convertScoCenterToV3JobRepository.performAsync.getCall(0).args).to.deep.equal([
      new ConvertScoCenterToV3Job({ centerId: center1.id }),
    ]);
    expect(convertScoCenterToV3JobRepository.performAsync.getCall(1).args).to.deep.equal([
      new ConvertScoCenterToV3Job({ centerId: center2.id }),
    ]);
    expect(numberOfCenters).to.equal(2);
  });

  describe('when is a dry run', function () {
    it('should not trigger conversion orders', async function () {
      // given
      const center1 = domainBuilder.certification.configuration.buildCenter({
        id: 1,
        type: CenterTypes.SCO,
        externalId: 'center1',
      });
      centerRepository.findSCOV2Centers.onCall(0).returns([center1]);
      centerRepository.findSCOV2Centers.onCall(1).returns([]);

      // when
      const numberOfCenters = await findAndTriggerV2CenterToConvertInV3({
        isDryRun: true,
        centerRepository,
        convertScoCenterToV3JobRepository,
      });

      // then
      expect(centerRepository.findSCOV2Centers).to.have.been.calledTwice;
      expect(convertScoCenterToV3JobRepository.performAsync).to.not.have.been.called;
      expect(numberOfCenters).to.equal(1);
    });
  });

  context('when center is in whitelist', function () {
    let originalEnvValueWhitelist;

    beforeEach(function () {
      originalEnvValueWhitelist = config.features.pixCertifScoBlockedAccessWhitelist;
      config.features.pixCertifScoBlockedAccessWhitelist = [];
    });

    afterEach(function () {
      config.features.pixCertifScoBlockedAccessWhitelist = originalEnvValueWhitelist;
    });

    it('should filter out center from whitelist', async function () {
      // given
      // config is already uppercased + trimmed
      config.features.pixCertifScoBlockedAccessWhitelist = ['WHITELISTED12'];
      const center1 = domainBuilder.certification.configuration.buildCenter({
        id: 1,
        type: CenterTypes.SCO,
        externalId: 'whiteLISTed12',
      });
      const center2 = domainBuilder.certification.configuration.buildCenter({
        id: 2,
        type: CenterTypes.SCO,
        externalId: 'CONVERT_ME',
      });
      centerRepository.findSCOV2Centers.onCall(0).returns([center1, center2]);
      centerRepository.findSCOV2Centers.onCall(1).returns([]);

      convertScoCenterToV3JobRepository.performAsync.resolves();

      // when
      const numberOfCenters = await findAndTriggerV2CenterToConvertInV3({
        centerRepository,
        convertScoCenterToV3JobRepository,
      });

      // then
      expect(convertScoCenterToV3JobRepository.performAsync).to.have.been.calledOnceWithExactly(
        new ConvertScoCenterToV3Job({ centerId: center2.id }),
      );
      expect(numberOfCenters).to.equal(1);
      expect(centerRepository.findSCOV2Centers).to.have.been.calledTwice;
      expect(centerRepository.findSCOV2Centers.getCall(0).args).to.deep.equal([{ cursorId: undefined }]);
      expect(centerRepository.findSCOV2Centers.getCall(1).args).to.deep.equal([{ cursorId: center2.id }]);
    });
  });
});
