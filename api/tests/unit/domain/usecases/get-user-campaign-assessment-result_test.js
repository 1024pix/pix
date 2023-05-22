import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper.js';
import { getUserCampaignAssessmentResult } from '../../../../lib/domain/usecases/get-user-campaign-assessment-result.js';
import { NotFoundError, NoCampaignParticipationForUserAndCampaign } from '../../../../lib/domain/errors.js';

describe('Unit | UseCase | get-user-campaign-assessment-result', function () {
  const locale = 'locale',
    campaignId = 123,
    userId = 456;
  let participantResultRepository, badgeRepository;
  let knowledgeElementRepository, badgeForCalculationRepository;
  let args;

  beforeEach(function () {
    badgeForCalculationRepository = { findByCampaignId: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    badgeRepository = { findByCampaignId: sinon.stub() };
    participantResultRepository = { getByUserIdAndCampaignId: sinon.stub() };
    args = {
      userId,
      campaignId,
      locale,
      badgeForCalculationRepository,
      knowledgeElementRepository,
      badgeRepository,
      participantResultRepository,
    };
  });

  context('when NotFound error to catch is thrown during process', function () {
    it('should throw NoCampaignParticipationForUserAndCampaign error', async function () {
      // given
      badgeRepository.findByCampaignId.rejects(new NotFoundError());
      knowledgeElementRepository.findUniqByUserId.rejects('I should not be called');
      badgeForCalculationRepository.findByCampaignId.rejects('I should not be called');
      participantResultRepository.getByUserIdAndCampaignId.rejects('I should not be called');

      // when
      const error = await catchErr(getUserCampaignAssessmentResult)(args);

      // then
      expect(error).to.be.instanceOf(NoCampaignParticipationForUserAndCampaign);
    });
  });

  context('when no error to catch is thrown during process', function () {
    it('should return the assessment result with badges validity', async function () {
      // given
      const expectedCampaignAssessmentResult = Symbol('campaign assessment result');
      const badge1 = domainBuilder.buildBadge({ id: 1 });
      const badgeForCalculationObtained1 = domainBuilder.buildBadgeForCalculation.mockObtainable({ id: badge1.id });
      const badge2 = domainBuilder.buildBadge({ id: 2 });
      const badgeForCalculationNotObtained2 = domainBuilder.buildBadgeForCalculation.mockNotObtainable({
        id: badge2.id,
      });
      const badge3 = domainBuilder.buildBadge({ id: 3 });
      const badgeForCalculationObtained3 = domainBuilder.buildBadgeForCalculation.mockObtainable({ id: badge3.id });
      badgeRepository.findByCampaignId.withArgs(campaignId).resolves([badge1, badge2, badge3]);
      knowledgeElementRepository.findUniqByUserId
        .withArgs({ userId })
        .resolves([domainBuilder.buildKnowledgeElement()]);
      badgeForCalculationRepository.findByCampaignId
        .withArgs({ campaignId })
        .resolves([badgeForCalculationObtained1, badgeForCalculationNotObtained2, badgeForCalculationObtained3]);
      participantResultRepository.getByUserIdAndCampaignId
        .withArgs({
          userId,
          campaignId,
          locale,
          badges: [
            { ...badge1, isValid: true },
            { ...badge2, isValid: false },
            { ...badge3, isValid: true },
          ],
        })
        .resolves(expectedCampaignAssessmentResult);

      // when
      const campaignAssessmentResult = await getUserCampaignAssessmentResult(args);

      // then
      expect(campaignAssessmentResult).to.deep.equal(expectedCampaignAssessmentResult);
    });
  });
});
