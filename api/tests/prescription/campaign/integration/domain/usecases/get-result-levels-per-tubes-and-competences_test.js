import { CampaignResultLevelsPerTubesAndCompetences } from '../../../../../../src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';
import { CompetenceResultForKnowledgeElementSnapshots } from '../../../../../../src/prescription/campaign/domain/models/CompetenceResultForKnowledgeElementSnapshots.js';
import { TubeResultForKnowledgeElementSnapshots } from '../../../../../../src/prescription/campaign/domain/models/TubeResultForKnowledgeElementSnapshots.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/index.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | UseCase | get-result-levels-per-tubes-and-competences', function () {
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
    const user2ke1 = databaseBuilder.factory.buildKnowledgeElement({
      status: KnowledgeElement.StatusType.INVALIDATED,
      skillId: learningContentData.skills[0].id,
      userId: secondParticipation.userId,
    });

    databaseBuilder.factory.buildKnowledgeElementSnapshot({
      campaignParticipationId: firstParticipation.id,
      snapshot: new KnowledgeElementCollection([user1ke1]).toSnapshot(),
    });
    databaseBuilder.factory.buildKnowledgeElementSnapshot({
      campaignParticipationId: secondParticipation.id,
      snapshot: new KnowledgeElementCollection([user2ke1]).toSnapshot(),
    });

    await databaseBuilder.commit();
  });

  it('should return a CampaignResultLevelsPerTubesAndCompetences', async function () {
    const result = await usecases.getResultLevelsPerTubesAndCompetences({ campaignId, locale: FRENCH_SPOKEN });

    expect(result).instanceOf(CampaignResultLevelsPerTubesAndCompetences);
    expect(result.maxReachableLevel).to.equal(1);
    expect(result.meanReachedLevel).to.equal(0.5);
    expect(result.levelsPerCompetence[0]).instanceOf(CompetenceResultForKnowledgeElementSnapshots);
    expect(result.levelsPerTube[0]).instanceOf(TubeResultForKnowledgeElementSnapshots);
    expect(result.levelsPerCompetence).to.deep.equal([
      {
        description: 'description FR Compétence 1',
        id: 'recCompetence1',
        index: '1.1',
        maxLevel: 1,
        meanLevel: 0.5,
        name: 'name FR Compétence 1',
      },
    ]);
    expect(result.levelsPerTube).to.equalWithGetter([
      {
        competenceId: 'recCompetence1',
        competenceName: 'name FR Compétence 1',
        id: 'recTube1',
        maxLevel: 1,
        meanLevel: 0.5,
        description: 'recTube1 fr description',
        title: 'Tube 1 fr title',
      },
    ]);
  });
});
