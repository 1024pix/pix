import { getTutorialSteps } from '../../../../../../src/prescription/campaign/domain/usecases/get-tutorial-steps.js';
import { LOCALE } from '../../../../../../src/shared/domain/constants.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const { FRENCH_SPOKEN } = LOCALE;

describe('Unit | Domain | Use Cases | get-tutorial-steps', function () {
  let badgeRepository;
  let campaignRepository;
  let learningContentRepository;

  const locale = FRENCH_SPOKEN;
  const campaignId = 'someCampaignId';

  beforeEach(function () {
    badgeRepository = { findByCampaignId: sinon.stub() };
    campaignRepository = { get: sinon.stub() };
    learningContentRepository = { findByCampaignId: sinon.stub() };
  });

  context('when campaign has a custom landing page text', function () {
    it('should return the campaign custom landing page text', async function () {
      // given
      const customLandingPageText = Symbol('custom landing page text');
      campaignRepository.get.withArgs(campaignId).resolves({ customLandingPageText });

      // when
      const tutorialSteps = await getTutorialSteps({
        campaignId,
        locale,
        campaignRepository,
        badgeRepository,
        learningContentRepository,
      });

      // then
      expect(tutorialSteps).to.deep.equal({
        customLandingPageText,
        badges: undefined,
        competences: undefined,
      });
    });
  });

  context('when campaign has associated badges', function () {
    it('should return a list of associated badges', async function () {
      // given
      const badges = [Symbol('badge'), Symbol('badge')];
      badgeRepository.findByCampaignId.withArgs(campaignId).resolves(badges);

      // when
      const tutorialSteps = await getTutorialSteps({
        campaignId,
        locale,
        campaignRepository,
        badgeRepository,
        learningContentRepository,
      });

      // then
      expect(tutorialSteps).to.deep.equal({
        customLandingPageText: undefined,
        badges: badges,
        competences: undefined,
      });
    });
  });

  context('when campaign has competences', function () {
    it('should return a list of competences', async function () {
      // given
      const learningContent = domainBuilder.buildLearningContent.withSimpleContent();

      learningContentRepository.findByCampaignId.withArgs(campaignId, locale).resolves(learningContent);

      // when
      const tutorialSteps = await getTutorialSteps({
        campaignId,
        locale,
        campaignRepository,
        badgeRepository,
        learningContentRepository,
      });

      // then
      expect(tutorialSteps).to.deep.equal({
        customLandingPageText: undefined,
        badges: undefined,
        competences: learningContent.frameworks[0].areas[0].competences,
      });
    });
  });
});
