import sinon from 'sinon';

import {
  CampaignUniqueCodeError,
  UnknownCampaignId,
} from '../../../../../../src/prescription/campaign/domain/errors.js';
import { updateCampaignCode } from '../../../../../../src/prescription/campaign/domain/usecases/update-campaign-code.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Campaign | Domain | UseCase | update-campaign-code', function () {
  let campaignAdministrationRepository, codeGenerator, campaignStub, accessCodeRepository;

  beforeEach(function () {
    campaignAdministrationRepository = { get: sinon.stub(), update: sinon.stub() };
    accessCodeRepository = {
      isCodeAvailable: sinon.stub(),
    };
    codeGenerator = { validate: sinon.stub() };
    campaignStub = { updateFields: sinon.stub() };
  });

  context('when campaignId not match a campaign', function () {
    it('should throw an UnknonwCampaignId', async function () {
      // given
      const campaignId = Symbol('campaign-id');
      const campaignCode = Symbol('campaign-code');
      campaignAdministrationRepository.get.withArgs(campaignId).resolves(null);

      // when
      const error = await catchErr(updateCampaignCode)({
        campaignId,
        campaignCode,
        campaignAdministrationRepository,
        accessCodeRepository,
      });

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
      accessCodeRepository.isCodeAvailable.withArgs({ code: campaignCode }).resolves(false);
      // when
      const error = await catchErr(updateCampaignCode)({
        accessCodeRepository,
        campaignId,
        campaignCode,
        campaignAdministrationRepository,
        codeGenerator,
      });

      expect(error).to.be.an.instanceOf(CampaignUniqueCodeError);
    });
  });
});
