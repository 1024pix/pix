import { expect, sinon, catchErr } from '../../../../../test-helper.js';
import { updateCampaignCode } from '../../../../../../src/prescription/campaign/domain/usecases/update-campaign-code.js';
import {
  CampaignCodeFormatError,
  CampaignUniqueCodeError,
  UnknownCampaignId,
} from '../../../../../../src/prescription/campaign/domain/errors.js';

describe('Unit | UseCase | update-campaign-code', function () {
  let campaignAdministrationRepository, codeGenerator;

  beforeEach(function () {
    campaignAdministrationRepository = { get: sinon.stub(), isCodeAvailable: sinon.stub(), update: sinon.stub() };
    codeGenerator = { validate: sinon.stub() };
  });

  it('should update campaign code', async function () {
    // given
    const campaignId = Symbol('campaign-id');
    const campaignCode = Symbol('campaign-code');

    codeGenerator.validate.withArgs(campaignCode).returns(true);
    campaignAdministrationRepository.get.withArgs(campaignId).resolves(Symbol('campaign'));
    campaignAdministrationRepository.isCodeAvailable.withArgs(campaignCode).resolves(true);

    // when
    await updateCampaignCode({ campaignId, campaignCode, campaignAdministrationRepository, codeGenerator });

    // then
    expect(campaignAdministrationRepository.update).to.have.been.calledOnceWithExactly({
      campaignId,
      campaignAttributes: { code: campaignCode },
    });
  });
  context('when campaignId not match a campaign', function () {
    it('should throw an UnknonwCampaignId', async function () {
      // given
      const campaignId = Symbol('campaign-id');
      const campaignCode = Symbol('campaign-code');
      campaignAdministrationRepository.get.withArgs(campaignId).resolves(null);

      // when
      const error = await catchErr(updateCampaignCode)({ campaignId, campaignCode, campaignAdministrationRepository });

      expect(error).to.be.an.instanceOf(UnknownCampaignId);
    });
  });

  context("when campaign's code has a wrong format", function () {
    it('should throw a CampaignCodeFormatError', async function () {
      // given
      const campaignId = Symbol('campaign-id');
      const campaignCode = Symbol('campaign-code');
      campaignAdministrationRepository.get.withArgs(campaignId).resolves(Symbol('campaign'));
      codeGenerator.validate.withArgs(campaignCode).returns(false);
      // when
      const error = await catchErr(updateCampaignCode)({
        campaignId,
        campaignCode,
        campaignAdministrationRepository,
        codeGenerator,
      });

      expect(error).to.be.an.instanceOf(CampaignCodeFormatError);
    });
  });

  context("when campaign's code already exists", function () {
    it('should throw a CampaignUniqueCodeError', async function () {
      // given
      const campaignId = Symbol('campaign-id');
      const campaignCode = Symbol('campaign-code');
      campaignAdministrationRepository.get.withArgs(campaignId).resolves(Symbol('campaign'));
      codeGenerator.validate.withArgs(campaignCode).returns(true);
      campaignAdministrationRepository.isCodeAvailable.withArgs(campaignCode).resolves(false);
      // when
      const error = await catchErr(updateCampaignCode)({
        campaignId,
        campaignCode,
        campaignAdministrationRepository,
        codeGenerator,
      });

      expect(error).to.be.an.instanceOf(CampaignUniqueCodeError);
    });
  });
});
