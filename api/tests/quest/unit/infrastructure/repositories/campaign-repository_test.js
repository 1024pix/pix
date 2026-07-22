import sinon from 'sinon';

import { Campaign } from '../../../../../src/quest/domain/models/combined-courses/entities/Campaign.js';
import * as campaignRepository from '../../../../../src/quest/infrastructure/repositories/combined-courses/campaign-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Repositories | campaign', function () {
  let id;
  let code;
  let campaignsApiStub;
  let expectedResult;

  beforeEach(function () {
    id = Symbol('id');
    code = Symbol('code');
    expectedResult = {
      id: 1,
      organizationId: 1,
      name: 'campagne',
      code: 'abc',
      targetProfileId: 123,
      creatorId: 1,
      ownerId: 1,
      title: 'titre campagne',
      customResultPageButtonUrl: '/results',
      customResultPageButtonText: 'Continuer',
    };
    campaignsApiStub = {
      get: sinon.stub(),
      getByCode: sinon.stub(),
      save: sinon.stub(),
    };
    campaignsApiStub.get.withArgs(id).resolves(new Campaign(expectedResult));
    campaignsApiStub.getByCode.withArgs(code).resolves(new Campaign(expectedResult));
  });

  describe('#get', function () {
    it('should call get method from campaignsApi', async function () {
      // when
      const result = await campaignRepository.get({ id, campaignsApi: campaignsApiStub });

      // then
      expect(result).to.be.an.instanceof(Campaign);
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#getByCode', function () {
    it('should call getByCode method from campaignsApi', async function () {
      // when
      const result = await campaignRepository.getByCode({ code, campaignsApi: campaignsApiStub });

      // then
      expect(result).to.be.an.instanceof(Campaign);
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#save', function () {
    it('should call save method from campaignsApi', async function () {
      // given
      const campaigns = [
        {
          creatorId: 2,
          customResultPageButtonText: 'customResultPageButtonText',
          customResultPageButtonUrl: 'customResultPageButtonUrl',
          name: 'campagne',
          type: 'ASSESSMENT',
          multipleSendings: false,
          organizationId: 3,
          targetProfileId: 123,
          title: 'title',
        },
        {
          creatorId: 2,
          customResultPageButtonText: 'customResultPageButtonText',
          customResultPageButtonUrl: 'customResultPageButtonUrl',
          name: 'campagne',
          type: 'ASSESSMENT',
          multipleSendings: false,
          organizationId: 3,
          targetProfileId: 123,
          title: 'title',
        },
      ];

      const expectedCreatedCampaigns = campaigns.map((campaign, index) => ({
        ...campaign,
        id: index,
        code: `code${index}`,
      }));
      campaignsApiStub.save
        .withArgs(campaigns, { allowCreationWithoutTargetProfileShare: true })
        .resolves(expectedCreatedCampaigns);

      // when
      const result = await campaignRepository.save(
        { campaigns, campaignsApi: campaignsApiStub },
        { allowCreationWithoutTargetProfileShare: true },
      );

      // then
      expect(result).to.deep.equal([
        new Campaign({ ...expectedCreatedCampaigns[0], id: 0, code: 'code0' }),
        new Campaign({ ...expectedCreatedCampaigns[1], id: 1, code: 'code1' }),
      ]);
    });
  });
});
