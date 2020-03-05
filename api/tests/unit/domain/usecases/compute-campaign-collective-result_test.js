const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignCollectiveResult } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | compute-campaign-collective-result', () => {
  const userId = 1;
  const campaignId = 'someCampaignId';
  let campaignRepository;
  let campaignCollectiveResultRepository;
  let competenceRepository;
  let tubeRepository;

  beforeEach(() => {
    campaignCollectiveResultRepository = {
      getCampaignCollectiveResultByCompetence: sinon.stub(),
      getCampaignCollectiveResultByTube: sinon.stub(),
    };
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    competenceRepository = { list: sinon.stub() };
    tubeRepository = { list: sinon.stub() };
  });

  context('User has access to this result', () => {

    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
    });

    context('When user asked for competence view', () => {
      const view = 'competence';
      const competences = Symbol('competences');

      beforeEach(() => {
        competenceRepository.list.resolves(competences);
      });

      it('should resolve a CampaignCollectiveResult', async () => {
        // given
        const expectedCampaignCollectiveResult = domainBuilder.buildCampaignCollectiveResult();
        campaignCollectiveResultRepository.getCampaignCollectiveResultByCompetence.withArgs(campaignId, competences).resolves(expectedCampaignCollectiveResult);

        // when
        const actualCampaignCollectiveResult = await computeCampaignCollectiveResult({
          userId,
          campaignId,
          view,
          campaignRepository,
          campaignCollectiveResultRepository,
          competenceRepository,
          tubeRepository,
        });

        // then
        expect(competenceRepository.list).to.have.been.calledOnce;
        expect(actualCampaignCollectiveResult).to.equal(expectedCampaignCollectiveResult);
      });
    });

    context('When user asked for tube view', () => {
      const view = 'tube';
      const tubes = Symbol('tubes');

      beforeEach(() => {
        tubeRepository.list.resolves(tubes);
      });

      it('should resolve a CampaignCollectiveResult', async () => {
        // given
        const expectedCampaignCollectiveResult = domainBuilder.buildCampaignCollectiveResult();
        campaignCollectiveResultRepository.getCampaignCollectiveResultByTube.withArgs(campaignId, tubes).resolves(expectedCampaignCollectiveResult);

        // when
        const actualCampaignCollectiveResult = await computeCampaignCollectiveResult({
          userId,
          campaignId,
          view,
          campaignRepository,
          campaignCollectiveResultRepository,
          competenceRepository,
          tubeRepository,
        });

        // then
        expect(tubeRepository.list).to.have.been.calledOnce;
        expect(actualCampaignCollectiveResult).to.equal(expectedCampaignCollectiveResult);
      });
    });
  });

  context('User does not belong to the organization', () => {
    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('it should throw an UserNotAuthorizedToAccessEntity error', async () => {
      // when
      const result = await catchErr(computeCampaignCollectiveResult)({
        userId,
        campaignId,
        campaignRepository,
        campaignCollectiveResultRepository,
        competenceRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
