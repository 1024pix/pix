import { CampaignResultLevelsPerTubesAndCompetences } from '../../../../../../src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { LOCALE } from '../../../../../../src/shared/domain/constants.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Prescription Integration | UseCase | get-result-levels-per-tubes-and-competences', function () {
  let campaignId;

  beforeEach(async function () {
    const learningContentData = {
      frameworks: [{ id: 'frameworkId', name: 'frameworkName' }],
      areas: [{ id: 'recArea1', frameworkId: 'frameworkId', competenceIds: ['recCompetence1'] }],
      competences: [
        {
          id: 'recCompetence1',
          name_i18n: { fr: 'name FR Compétence 1', en: 'name EN Compétence 1' },
          description_i18n: { fr: 'description FR Compétence 1', en: 'description EN Compétence 1' },
          index: '1.1',
          skillIds: ['recSkillWeb1', 'recSkillWeb2', 'recSkillUrl1', 'recSkillUrl2'],
          areaId: 'recArea1',
          origin: 'Pix',
        },
      ],
      thematics: [],
      tubes: [
        {
          id: 'recTube1',
          name: '@tubeWeb1',
          title: 'Title recTube1',
          description: 'recTube1 description',
          practicalTitle_i18n: { fr: 'Tube 1 fr title', en: 'Tube 1 en title' },
          practicalDescription_i18n: { fr: 'recTube1 fr description', en: 'recTube1 en description' },
          competenceId: 'recCompetence1',
          skillIds: ['recSkillWeb1', 'recSkillWeb2'],
        },
        {
          id: 'recTube2',
          name: '@tubeUrl2',
          title: 'Title recTube2',
          description: 'recTube2 description',
          practicalTitle_i18n: { fr: 'Tube 2 fr title', en: 'Tube 2 en title' },
          practicalDescription_i18n: { fr: 'recTube2 fr description', en: 'recTube2 en description' },
          competenceId: 'recCompetence1',
          skillIds: ['recSkillUrl1', 'recSkillUrl2'],
        },
      ],
      skills: [
        {
          id: 'recSkillWeb1',
          name: '@web1',
          tubeId: 'recTube1',
          status: 'actif',
          level: 1,
          competenceId: 'recCompetence1',
        },
        {
          id: 'recSkillWeb2',
          name: '@web2',
          tubeId: 'recTube1',
          status: 'actif',
          level: 2,
          competenceId: 'recCompetence1',
        },
        {
          id: 'recSkillUrl1',
          name: '@url1',
          tubeId: 'recTube2',
          status: 'actif',
          level: 3,
          competenceId: 'recCompetence1',
        },
        {
          id: 'recSkillUrl2',
          name: '@url2',
          tubeId: 'recTube2',
          status: 'actif',
          level: 4,
          competenceId: 'recCompetence1',
        },
      ],
      challenges: [],
    };
    await databaseBuilder.factory.learningContent.build(learningContentData);

    campaignId = databaseBuilder.factory.buildCampaign({
      type: CampaignTypes.ASSESSMENT,
    }).id;

    const firstParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId });
    const secondParticipation = databaseBuilder.factory.buildCampaignParticipation({ campaignId });

    learningContentData.skills.forEach((skill) => {
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skill.id });
    });

    const user1ke1 = databaseBuilder.factory.buildKnowledgeElement({
      status: KnowledgeElement.StatusType.VALIDATED,
      skillId: learningContentData.skills[0].id,
      userId: firstParticipation.userId,
    });
    const user1ke2 = databaseBuilder.factory.buildKnowledgeElement({
      status: KnowledgeElement.StatusType.INVALIDATED,
      skillId: learningContentData.skills[1].id,
      userId: firstParticipation.userId,
    });

    const user2ke1 = databaseBuilder.factory.buildKnowledgeElement({
      status: KnowledgeElement.StatusType.VALIDATED,
      skillId: learningContentData.skills[2].id,
      userId: secondParticipation.userId,
    });

    const user2ke2 = databaseBuilder.factory.buildKnowledgeElement({
      status: KnowledgeElement.StatusType.VALIDATED,
      skillId: learningContentData.skills[3].id,
      userId: secondParticipation.userId,
    });

    databaseBuilder.factory.buildKnowledgeElementSnapshot({
      campaignParticipationId: firstParticipation.id,
      snapshot: new KnowledgeElementCollection([user1ke1, user1ke2]).toSnapshot(),
    });
    databaseBuilder.factory.buildKnowledgeElementSnapshot({
      campaignParticipationId: secondParticipation.id,
      snapshot: new KnowledgeElementCollection([user2ke1, user2ke2]).toSnapshot(),
    });

    await databaseBuilder.commit();
  });

  it('should return a CampaignResultLevelsPerTubesAndCompetences', async function () {
    const result = await usecases.getResultLevelsPerTubesAndCompetences({ campaignId, locale: LOCALE.FRENCH_SPOKEN });

    expect(result).instanceOf(CampaignResultLevelsPerTubesAndCompetences);
    expect(result.campaignMaxReachableLevel).to.equal(3);
    expect(result.campaignMeanReachedLevel).to.equal(1.25);
  });
});
