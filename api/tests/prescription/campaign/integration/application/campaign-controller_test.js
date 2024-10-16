import { campaignController } from '../../../../../src/prescription/campaign/application/campaign-controller.js';
import { usecases } from '../../../../../src/prescription/campaign/domain/usecases/index.js';
import {
  databaseBuilder,
  expect,
  hFake,
  learningContentBuilder,
  mockLearningContent,
  sinon,
} from '../../../../test-helper.js';

describe('Integration | Application | campaign-controller', function () {
  describe('#getTutorialSteps', function () {
    it('returns organizations groups', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();

      const customLandingPageText = 'Some text';
      const badges = [databaseBuilder.factory.buildBadge()];

      const learningContent = [
        {
          id: 'recArea1',
          competences: [{ id: 'competenceId', index: '1.1' }],
        },
      ];
      const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);

      await databaseBuilder.commit();

      sinon.stub(usecases, 'getTutorialSteps').withArgs({ campaignId: campaign.id, locale: 'fr-fr' }).resolves({
        customLandingPageText,
        badges,
        competences: learningContentObjects.competences,
      });

      // when
      const request = { params: { campaignId: campaign.id } };
      const result = await campaignController.getTutorialSteps(request, hFake);

      // then
      expect(result).to.deep.equal({
        data: {
          attributes: {
            'custom-landing-page-text': customLandingPageText,
          },
          relationships: {
            badges: {
              data: [
                {
                  id: String(badges[0].id),
                  type: 'badges',
                },
              ],
            },
            competences: {
              data: [
                {
                  id: learningContentObjects.competences[0].id,
                  type: 'competences',
                },
              ],
            },
          },
          type: 'campaign-tutorial-steps',
        },
        included: [
          {
            attributes: {
              'alt-message': badges[0].altMessage,
              'image-url': badges[0].imageUrl,
              'is-always-visible': badges[0].isAlwaysVisible,
              'is-certifiable': badges[0].isCertifiable,
              key: badges[0].key,
              message: badges[0].message,
              title: badges[0].title,
            },
            id: String(badges[0].id),
            type: 'badges',
          },
          {
            attributes: {
              index: learningContentObjects.competences[0].index,
            },
            id: learningContentObjects.competences[0].id,
            type: 'competences',
          },
        ],
      });
    });
  });
});
