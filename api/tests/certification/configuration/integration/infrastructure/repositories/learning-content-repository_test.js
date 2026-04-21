import * as learningContentRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/learning-content-repository.js';
import { FRENCH_FRANCE } from '../../../../../../src/shared/domain/services/locale-service.js';

import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Configuration | Integration | Infrastructure | Repository | LearningContentRepository', function () {
  describe('#getFrameworkReferential', function () {
    it('should return the expected framework referential', async function () {
      // given
      const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
      const areaId = databaseBuilder.factory.learningContent.buildArea({ id: 'area', frameworkId }).id;
      const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ id: 'competence', areaId }).id;
      const thematicId = databaseBuilder.factory.learningContent.buildCompetence({ id: 'thematic', competenceId }).id;
      const tubeId = databaseBuilder.factory.learningContent.buildTube({ id: 'tube', competenceId, thematicId }).id;
      const skillId = databaseBuilder.factory.learningContent.buildSkill({ id: 'skill', tubeId, competenceId }).id;
      const challenge1 = databaseBuilder.factory.learningContent.buildChallenge({
        id: 'chall1',
        skillId,
        locales: [FRENCH_FRANCE],
      });
      const challenge2 = databaseBuilder.factory.learningContent.buildChallenge({
        id: 'chall2',
        skillId,
        locales: [FRENCH_FRANCE],
      });

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();

      const frameworksChallenge1 = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        complementaryCertificationKey: complementaryCertification.key,
        challengeId: challenge1.id,
        calibrationId: 1,
      });
      const frameworksChallenge2 = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        complementaryCertificationKey: complementaryCertification.key,
        challengeId: challenge2.id,
        calibrationId: 1,
      });
      await databaseBuilder.commit();

      // when
      const result = await learningContentRepository.getFrameworkReferential({
        challengeIds: [frameworksChallenge1.challengeId, frameworksChallenge2.challengeId],
      });

      // then
      expect(result).to.deep.have.members([
        {
          id: areaId,
          frameworkId,
          code: 'code Domaine A',
          name: 'name Domaine A',
          title: 'title FR Domaine A',
          color: 'color Domaine A',
          competences: [
            {
              id: competenceId,
              name: 'name FR Compétence A',
              index: 'index Compétence A',
              description: 'description FR Compétence A',
              origin: 'origin Compétence A',
              areaId,
              level: -1,
              skillIds: [],
              thematicIds: [],
              tubes: [
                {
                  id: tubeId,
                  practicalTitle: 'practicalTitle FR Tube A',
                  practicalDescription: 'practicalDescription FR Tube A',
                  isMobileCompliant: true,
                  isTabletCompliant: true,
                  skills: [
                    {
                      id: skillId,
                      name: 'name Acquis A',
                      pixValue: 2.9,
                      competenceId,
                      tutorialIds: [],
                      learningMoreTutorialIds: [],
                      tubeId,
                      version: 5,
                      difficulty: 2,
                      status: 'status Acquis A',
                      hintStatus: 'hintStatus Acquis A',
                      hint: 'Un indice',
                    },
                  ],
                  competenceId,
                  thematicId,
                  skillIds: [],
                  name: 'name Tube A',
                },
              ],
              thematics: [],
            },
          ],
        },
      ]);
    });
  });
});
