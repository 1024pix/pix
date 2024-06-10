import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import {
  databaseBuilder,
  domainBuilder,
  expect,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

function buildLearningContent() {
  const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
  const learningContentObjects = learningContentBuilder([learningContent]);
  mockLearningContent(learningContentObjects);
}

describe('Integration | Domain | UseCases | get-campaign-parameters-for-simulator', function () {
  it('should return skills and challenges', async function () {
    // given
    const campaignId = 100000;

    databaseBuilder.factory.buildCampaign({ id: campaignId });
    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skillId' });

    await databaseBuilder.commit();
    buildLearningContent();

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
