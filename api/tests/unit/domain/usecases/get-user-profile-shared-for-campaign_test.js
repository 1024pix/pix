const { expect, sinon, catchErr } = require('../../../test-helper');
const getUserProfileSharedForCampaign = require('../../../../lib/domain/usecases/get-user-profile-shared-for-campaign');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const { NoCampaignParticipationForUserAndCampaign } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-user-profile-shared-for-campaign', () => {

  const sharedAt = new Date('2020-02-01');
  const userId = Symbol('user id');
  const campaignId = Symbol('campaign id');
  const expectedCampaignParticipation = { id: '1', sharedAt };
  let campaignParticipationRepository;
  let knowledgeElementRepository;
  let competenceRepository;
  
  context('When user has shared its profile for the campaign', () => {
    
    beforeEach(() => {
      campaignParticipationRepository = { findOneByCampaignIdAndUserId: sinon.stub() };
      knowledgeElementRepository = { findUniqByUserIdGroupedByCompetenceId: sinon.stub() };
      competenceRepository = { listPixCompetencesOnly: sinon.stub() };
      sinon.stub(Scorecard, 'buildFrom');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return the shared profile for campaign', async () => {
      const knowledgeElements = { 'competence1': [], 'competence2': [], };
      const competences = [{ id: 'competence1' },  { id: 'competence2' }];
      // given
      campaignParticipationRepository.findOneByCampaignIdAndUserId.withArgs({ userId, campaignId }).resolves(expectedCampaignParticipation);
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId.withArgs({ userId, limitDate: sharedAt }).resolves(knowledgeElements);
      competenceRepository.listPixCompetencesOnly.resolves(competences);
      Scorecard
        .buildFrom
        .withArgs({ userId, knowledgeElements: knowledgeElements['competence1'], competence: competences[0] })
        .returns({ id: 'Score1', earnedPix: 10 });
      Scorecard
        .buildFrom
        .withArgs({ userId, knowledgeElements: knowledgeElements['competence2'], competence: competences[1] })
        .returns({ id: 'Score2', earnedPix: 5 });
      
      // when
      const sharedProfile = await getUserProfileSharedForCampaign({
        userId,
        campaignId,
        campaignParticipationRepository,
        knowledgeElementRepository,
        competenceRepository,
      });

      // then
      expect(sharedProfile).to.deep.equal({
        id: '1',
        sharedAt,
        pixScore: 15,
        scorecards: [
          { id: 'Score1', earnedPix: 10 },
          { id: 'Score2', earnedPix: 5 },
        ]
      });
    });
  });

  context('When user has not shared its profile', () => {
    it('should throw an error', async () => {
      // given
      campaignParticipationRepository.findOneByCampaignIdAndUserId.withArgs({ userId, campaignId }).resolves(null);

      // when
      const result = await catchErr(getUserProfileSharedForCampaign)({
        userId,
        campaignId,
        campaignParticipationRepository,
        knowledgeElementRepository,
        competenceRepository,
      });

      // then
      expect(result).to.be.an.instanceOf(NoCampaignParticipationForUserAndCampaign);
      expect(result.message).to.be.equal('L\'utilisateur n\'a pas encore participé à la campagne');
    });
  });
});
