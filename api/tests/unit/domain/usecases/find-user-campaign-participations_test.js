const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const findUserCampaignParticipations = require('../../../../lib/domain/usecases/find-user-campaign-participations');

describe('Unit | UseCase | find-user-campaign-participations', () => {

  let authenticatedUserId;
  let requestedUserId;
  const campaignParticipationRepository = { findByUserIdUniqByCampaignId: () => undefined };

  it('should reject a NotAuthorized error if authenticated user ask for another user campaign participation', () => {
    // given
    authenticatedUserId = 1;
    requestedUserId = 2;

    // when
    const promise = findUserCampaignParticipations({ authenticatedUserId, requestedUserId, campaignParticipationRepository });

    // then
    return promise.catch((err) => {
      expect(err).to.be.an.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When authenticated User is authorized to retrieve his campaign participations', () => {

    beforeEach(() => {
      sinon.stub(campaignParticipationRepository, 'findByUserIdUniqByCampaignId');
    });

    it('should call findByUserIdUniqByCampaignId to find all campaign-participations', () => {
      // given
      authenticatedUserId = 1;
      requestedUserId = 1;
      campaignParticipationRepository.findByUserIdUniqByCampaignId.resolves();

      // when
      const promise = findUserCampaignParticipations({
        authenticatedUserId,
        requestedUserId,
        campaignParticipationRepository,
      });

      // then
      return promise.then(() => {
        expect(campaignParticipationRepository.findByUserIdUniqByCampaignId).to.have.been.calledWith(requestedUserId);
      });
    });

    it('should return user with his campaign participations', () => {
      // given
      const campaignParticipation1 = campaignParticipationRepository.findByUserIdUniqByCampaignId.resolves(domainBuilder.buildCampaignParticipation({ userId: requestedUserId }));
      const campaignParticipation2 = campaignParticipationRepository.findByUserIdUniqByCampaignId.resolves(domainBuilder.buildCampaignParticipation({ userId: requestedUserId }));
      campaignParticipationRepository.findByUserIdUniqByCampaignId.resolves([campaignParticipation1, campaignParticipation2]);

      // when
      const promise = findUserCampaignParticipations({
        authenticatedUserId,
        requestedUserId,
        campaignParticipationRepository,
      });

      // then
      return promise.then((foundCampaignParticipations) => {
        expect(foundCampaignParticipations).to.be.an.instanceOf(Array);
        expect(foundCampaignParticipations).to.have.length(2);
        expect(foundCampaignParticipations[0]).to.equal(campaignParticipation1);
        expect(foundCampaignParticipations[1]).to.equal(campaignParticipation2);
      });
    });
  });
});
