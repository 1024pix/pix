import { usecases as libUsecases } from '../../../../../../lib/domain/usecases/index.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import * as campaignApi from '../../../../../../src/prescription/campaign/application/api/campaigns-api.js';
import { expect, sinon, catchErr } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { UserNotAuthorizedToCreateCampaignError } from '../../../../../../lib/domain/errors.js';
import { Campaign } from '../../../../../../lib/domain/models/Campaign.js';

describe('Unit | API | Campaigns', function () {
  describe('#save', function () {
    it('should return code', async function () {
      const createdCampaign = domainBuilder.buildCampaign({ code: 'SOMETHING' });

      const createCampaignStub = sinon.stub(usecases, 'createCampaign');
      createCampaignStub
        .withArgs({
          campaign: {
            name: 'ABCDiag',
            title: 'Mon diagnostic Pix',
            customLandingPageText: 'Bienvenue',
            type: 'ASSESSMENT',
            targetProfileId: 1,
            creatorId: 2,
            ownerId: 2,
            organizationId: 1,
            multipleSendings: false,
          },
        })
        .resolves(createdCampaign);

      // when
      const result = await campaignApi.save({
        name: 'ABCDiag',
        title: 'Mon diagnostic Pix',
        targetProfileId: 1,
        organizationId: 1,
        creatorId: 2,
        customLandingPageText: 'Bienvenue',
      });

      // then
      expect(result.id).to.equal(createdCampaign.id);
      expect(result.code).to.equal(createdCampaign.code);
      expect(result).not.to.be.instanceOf(Campaign);
    });

    describe('When creator is not in organization or has no right to use target profile', function () {
      it('should throw an error', async function () {
        const createCampaignStub = sinon.stub(usecases, 'createCampaign');
        createCampaignStub
          .withArgs({
            campaign: {
              name: 'ABCDiag',
              title: 'Mon diagnostic Pix',
              customLandingPageText: 'Bienvenue',
              type: 'ASSESSMENT',
              targetProfileId: 1,
              creatorId: 2,
              ownerId: 2,
              organizationId: 1,
              multipleSendings: false,
            },
          })
          .rejects(new UserNotAuthorizedToCreateCampaignError());

        // when
        const error = await catchErr(campaignApi.save)({
          name: 'ABCDiag',
          title: 'Mon diagnostic Pix',
          targetProfileId: 1,
          organizationId: 1,
          creatorId: 2,
          customLandingPageText: 'Bienvenue',
        });

        // then
        expect(error).is.instanceOf(UserNotAuthorizedToCreateCampaignError);
      });
    });
  });

  describe('#get', function () {
    it('should return campaign informations', async function () {
      const campaignInformation = domainBuilder.buildCampaign({
        id: '777',
        code: 'SOMETHING',
        name: 'Godzilla',
        title: 'is Biohazard',
        customLandingPageText: 'Pika pika pikaCHUUUUUUUUUUUUUUUUUU',
        createdAt: new Date('2020-01-01'),
        archivedAt: new Date('2023-01-01'),
      });

      const getCampaignStub = sinon.stub(libUsecases, 'getCampaign');
      getCampaignStub.withArgs({ campaignId: campaignInformation.id }).resolves(campaignInformation);

      // when
      const result = await campaignApi.get(campaignInformation.id);

      // then
      expect(result.id).to.equal(campaignInformation.id);
      expect(result.code).to.equal(campaignInformation.code);
      expect(result.name).to.equal(campaignInformation.name);
      expect(result.title).to.equal(campaignInformation.title);
      expect(result.createdAt).to.equal(campaignInformation.createdAt);
      expect(result.archivedAt).to.equal(campaignInformation.archivedAt);
      expect(result.customLandingPageText).to.equal(campaignInformation.customLandingPageText);
      expect(result).not.to.be.instanceOf(Campaign);
    });
  });
});
