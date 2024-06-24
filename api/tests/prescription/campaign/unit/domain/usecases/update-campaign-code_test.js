import {
  CampaignUniqueCodeError,
  UnknownCampaignId,
} from '../../../../../../src/prescription/campaign/domain/errors.js';
import { updateCampaignCode } from '../../../../../../src/prescription/campaign/domain/usecases/update-campaign-code.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | update-campaign-code', function () {
  let campaignAdministrationRepository, codeGenerator, campaignStub;

  beforeEach(function () {
    campaignAdministrationRepository = { get: sinon.stub(), isCodeAvailable: sinon.stub(), update: sinon.stub() };
    codeGenerator = { validate: sinon.stub() };
    campaignStub = { updateFields: sinon.stub() };
  });

  it('should update campaign code', async function () {
    // given
    const campaignId = Symbol('campaign-id');
    const campaignCode = Symbol('campaign-code');

    codeGenerator.validate.withArgs(campaignCode).returns(true);
    campaignAdministrationRepository.get.withArgs(campaignId).resolves(campaignStub);
    campaignAdministrationRepository.isCodeAvailable.withArgs({ code: campaignCode }).resolves(true);

    // when
    await updateCampaignCode({ campaignId, campaignCode, campaignAdministrationRepository, codeGenerator });

    // then
    expect(campaignAdministrationRepository.update).to.have.been.calledOnceWithExactly(campaignStub);
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

  context("when campaign's code already exists", function () {
    it('should throw a CampaignUniqueCodeError', async function () {
      // given
      const campaignId = Symbol('campaign-id');
      const campaignCode = Symbol('campaign-code');
      campaignAdministrationRepository.get.withArgs(campaignId).resolves(campaignStub);
      codeGenerator.validate.withArgs(campaignCode).returns(true);
      campaignAdministrationRepository.isCodeAvailable.withArgs({ code: campaignCode }).resolves(false);
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
