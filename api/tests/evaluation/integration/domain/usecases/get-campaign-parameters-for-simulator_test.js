import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder, domainBuilder, expect, learningContentBuilder } from '../../../../test-helper.js';

function buildLearningContent() {
  const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
  const learningContentObjects = learningContentBuilder([learningContent]);
  databaseBuilder.factory.learningContent.build(learningContentObjects);
}

describe('Integration | Domain | UseCases | get-campaign-parameters-for-simulator', function () {
  describe('when the campaign does not exist', function () {
    it('should return show a not found error', async function () {
      expect(
        evaluationUsecases.getCampaignParametersForSimulator({
          campaignId: 666,
          locale: 'fr',
        }),
      ).to.eventually.throw(NotFoundError);
    });
  });

  describe('when the campaign do exists', function () {
    it('should return skills and challenges', async function () {
      // given
      const campaignId = 100000;

      databaseBuilder.factory.buildCampaign({ id: campaignId });
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skillId' });
      buildLearningContent();

      await databaseBuilder.commit();

      // when
      const result = await evaluationUsecases.getCampaignParametersForSimulator({
        campaignId,
        locale: 'fr',
      });

      // then
      expect(result).to.deep.equal({
        skills: [
          {
            id: 'skillId',
            name: '@sau6',
            pixValue: 3,
            competenceId: 'competenceId',
            tutorialIds: [],
            learningMoreTutorialIds: [],
            tubeId: 'tubeId',
            version: 1,
            difficulty: undefined,
          },
        ],
        challenges: [],
      });
    });
  });
});
