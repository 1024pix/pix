const { expect, sinon, catchErr } = require('../../../test-helper');
const getCampaignParticipationsWithResults = require('../../../../lib/domain/usecases/find-campaign-participations-with-results');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe.only('Unit | UseCase | get-campaign-participations-with-results', () => {

  let campaignParticipationsResult;
  let requestErr;

  let options;

  const userId = Symbol('user id');
  const sharedAt = Symbol('shared at');
  const campaignId = Symbol('campaign id');
  const targetProfile = Symbol('target profile');
  const competences = Symbol('competences');
  const assessment = Symbol('assessment');
  const knowledgeElements = Symbol('knowledge elements');
  const campaignParticipation = {
    assessment, user: { knowledgeElements }, sharedAt, campaignId,
    addCampaignParticipationResult: sinon.stub()
  };
  const campaignParticipations = { models: [ campaignParticipation ] };

  const campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
  const campaignParticipationRepository = { findWithCampaignParticipationResultsData: sinon.stub() };
  const targetProfileRepository = { getByCampaignId: sinon.stub() };
  const competenceRepository = { list: sinon.stub() };
  const assessmentRepository = { get: sinon.stub() };
  const smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub() };

  beforeEach(() => {
    options = null;
    requestErr = null;
  });

  context('the assessment belongs to the user', () => {
    beforeEach(async () => {
      options = { filter: { campaignId } };
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
      campaignParticipationRepository.findWithCampaignParticipationResultsData.resolves(campaignParticipations);
      targetProfileRepository.getByCampaignId.resolves(targetProfile);
      competenceRepository.list.resolves(competences);
      assessmentRepository.get.resolves(assessment);
      smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);

      campaignParticipationsResult = await getCampaignParticipationsWithResults({
        userId,
        options,
        campaignRepository,
        competenceRepository,
        targetProfileRepository,
        campaignParticipationRepository,
      });
    });
    it('should check if the user organization has access to the campaign', () => {
      expect(campaignRepository.checkIfUserOrganizationHasAccessToCampaign).to.have.been.calledWithExactly(campaignId, userId);
    });
    it('should retrieve the campaign participations datas', () => {
      expect(campaignParticipationRepository.findWithCampaignParticipationResultsData).to.have.been.calledWithExactly(options);
    });
    it('should retrieve the competences', () => {
      expect(competenceRepository.list).to.have.been.called;
    });
    it('should retrieve the target profile by campaign id', () => {
      expect(targetProfileRepository.getByCampaignId).to.have.been.calledWithExactly(campaignId);
    });
    it('should add the campaign participation results to each campaign participation', function() {
      expect(campaignParticipation.addCampaignParticipationResult).to.have.been.calledWithExactly({
        competences, targetProfile, assessment, knowledgeElements
      });
    });
    it('should return the campaign participations with results', () => {
      expect(campaignParticipationsResult).to.equal(campaignParticipations);
    });
  });
  xcontext('the assessment does not belong to the user', () => {
    beforeEach(async () => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);

      requestErr = await catchErr(getCampaignParticipationsWithResults)({
        userId,
        options,
        campaignParticipationRepository,
        campaignRepository
      });
    });
    it('should throw a UserNotAuthorizedToAccessEntity error', () => {
      expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
