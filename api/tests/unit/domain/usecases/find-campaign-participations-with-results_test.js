const { expect, sinon, catchErr } = require('../../../test-helper');
const getCampaignParticipationsWithResults = require('../../../../lib/domain/usecases/find-campaign-participations-with-results');
const CampaignParticipationResult = require('../../../../lib/domain/models/CampaignParticipationResult');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-participations-with-results', () => {

  let campaignParticipationsResult;
  let requestErr;

  const userId = Symbol('user id');
  const sharedAt = Symbol('shared at');
  const campaignId = Symbol('campaign id');
  const campaignParticipationId = Symbol('campaign participation id');
  const targetProfile = Symbol('target profile');
  const competences = Symbol('competences');
  const assessment = Symbol('assessment');
  const knowledgeElements = Symbol('knowledge elements');
  const campaignParticipationResult = Symbol('participation result');
  const campaignParticipation = {
    id: campaignParticipationId, assessment, user: { knowledgeElements }, sharedAt, campaignId,
  };
  const options = { filter: { campaignId } };
  const campaignParticipations = { models: [ campaignParticipation ] };

  const campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
  const campaignParticipationRepository = { findPaginatedCampaignParticipations: sinon.stub() };
  const targetProfileRepository = { getByCampaignId: sinon.stub() };
  const competenceRepository = { list: sinon.stub() };
  const assessmentRepository = { get: sinon.stub() };
  const knowledgeElementRepository = { findUniqByUserId: sinon.stub() };

  beforeEach(() => {
    requestErr = null;
  });

  context('the assessment belongs to the user', () => {
    beforeEach(async () => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
      campaignParticipationRepository.findPaginatedCampaignParticipations.resolves(campaignParticipations);
      targetProfileRepository.getByCampaignId.resolves(targetProfile);
      competenceRepository.list.resolves(competences);
      assessmentRepository.get.resolves(assessment);
      knowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);
      sinon.stub(CampaignParticipationResult, 'buildFrom').returns(campaignParticipationResult);

      campaignParticipationsResult = await getCampaignParticipationsWithResults({
        userId,
        options,
        campaignRepository,
        competenceRepository,
        targetProfileRepository,
        campaignParticipationRepository,
        assessmentRepository
      });
    });
    it('should check if the user organization has access to the campaign', () => {
      expect(campaignRepository.checkIfUserOrganizationHasAccessToCampaign).to.have.been.calledWithExactly(campaignId, userId);
    });
    it('should retrieve the campaign participations datas', () => {
      expect(campaignParticipationRepository.findPaginatedCampaignParticipations).to.have.been.calledWithExactly(options);
    });
    it('should retrieve the competences', () => {
      expect(competenceRepository.list).to.have.been.called;
    });
    it('should retrieve the target profile by campaign id', () => {
      expect(targetProfileRepository.getByCampaignId).to.have.been.calledWithExactly(campaignId);
    });
    it('should compute the campaign participation result', () => {
      expect(CampaignParticipationResult.buildFrom).to.have.been.calledWithExactly({
        campaignParticipationId, targetProfile, assessment, competences, knowledgeElements
      });
    });
    it('should return the campaign participations with results', () => {
      expect(campaignParticipationsResult).to.equal(campaignParticipations);
    });
  });
  context('the assessment does not belong to the user', () => {
    beforeEach(async () => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);

      requestErr = await catchErr(getCampaignParticipationsWithResults)({
        userId,
        options,
        campaignRepository,
        competenceRepository,
        targetProfileRepository,
        campaignParticipationRepository,
        assessmentRepository
      });
    });
    it('should throw a UserNotAuthorizedToAccessEntity error', () => {
      expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
