import { CampaignResultLevelsPerTubesAndCompetences } from '../../../../../../src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';
import { CompetenceResultForKnowledgeElementSnapshots } from '../../../../../../src/prescription/campaign/domain/models/CompetenceResultForKnowledgeElementSnapshots.js';
import { TubeResultForKnowledgeElementSnapshots } from '../../../../../../src/prescription/campaign/domain/models/TubeResultForKnowledgeElementSnapshots.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Prescription | Campaign participation | Usecase | get-result-levels-per-tubes-and-competences', function () {
  let campaignParticipation;

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

    const campaignId = databaseBuilder.factory.buildCampaign({
      type: CampaignTypes.ASSESSMENT,
    }).id;

    campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      status: CampaignParticipationStatuses.SHARED,
    });

    learningContentData.skills.forEach((skill) => {
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skill.id });
    });

    const ke = databaseBuilder.factory.buildKnowledgeElement({
      status: KnowledgeElement.StatusType.VALIDATED,
      skillId: learningContentData.skills[0].id,
      userId: campaignParticipation.userId,
    });

    databaseBuilder.factory.buildKnowledgeElementSnapshot({
      campaignParticipationId: campaignParticipation.id,
      snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
    });

    await databaseBuilder.commit();
  });

  it('should return a CampaignResultLevelsPerTubesAndCompetences', async function () {
    const result = await usecases.getResultLevelsPerTubesAndCompetences({
      campaignParticipationId: campaignParticipation.id,
      locale: FRENCH_SPOKEN,
    });

    expect(result).instanceOf(CampaignResultLevelsPerTubesAndCompetences);
    expect(result.id).equal(campaignParticipation.id);
    expect(result.maxReachableLevel).to.equal(1);
    expect(result.meanReachedLevel).to.equal(1);
    expect(result.levelsPerCompetence[0]).instanceOf(CompetenceResultForKnowledgeElementSnapshots);
    expect(result.levelsPerTube[0]).instanceOf(TubeResultForKnowledgeElementSnapshots);
    expect(result.levelsPerCompetence).to.deep.equal([
      {
        description: 'description FR Compétence 1',
        id: 'recCompetence1',
        index: '1.1',
        maxLevel: 1,
        meanLevel: 1,
        name: 'name FR Compétence 1',
      },
    ]);
    expect(result.levelsPerTube).to.equalWithGetter([
      {
        competenceId: 'recCompetence1',
        competenceName: 'name FR Compétence 1',
        id: 'recTube1',
        maxLevel: 1,
        meanLevel: 1,
        description: 'recTube1 fr description',
        title: 'Tube 1 fr title',
      },
    ]);
  });

  context('when participation is not shared', function () {
    it('should throw UserNotAuthorizedToAccessEntityError', async function () {
      const notSharedParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaignParticipation.campaignId,
        status: CampaignParticipationStatuses.STARTED,
      });
      await databaseBuilder.commit();

      const error = await catchErr(usecases.getResultLevelsPerTubesAndCompetences)({
        campaignParticipationId: notSharedParticipation.id,
        locale: FRENCH_SPOKEN,
      });

      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
