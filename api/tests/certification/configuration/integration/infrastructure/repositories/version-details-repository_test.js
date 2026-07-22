import * as versionDetailsRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/version-details-repository.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Repository | Version Details', function () {
  describe('#getById', function () {
    it('returns null when version is not found', async function () {
      // given
      domainBuilder.certification.configuration
        .versionDetailsBuilder()
        .asActive({ startDate: new Date('2020-01-01') })
        .withParameters({
          id: 123,
        })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      const versionDetails = await versionDetailsRepository.getById(456);

      // then
      expect(versionDetails).to.be.null;
    });

    it('returns a VersionDetails model when it exists', async function () {
      // given
      const expectedVersionDetails = domainBuilder.certification.configuration
        .versionDetailsBuilder()
        .asActive({ startDate: new Date('2020-01-01') })
        .withParameters({
          id: 123,
          scope: SCOPES.PIX_PLUS_PRO_SANTE,
          comments: 'Salut les zamis',
          minimumAnswersRequiredForValidation: 12,
          assessmentDuration: 25,
          maximumAssessmentLength: 50,
          challengesBetweenSameCompetence: 2,
          defaultProbabilityToPickChallenge: 40,
          defaultCandidateCapacity: -2,
          variationPercent: 0.66,
          limitToOneQuestionPerTube: true,
          enablePassageByAllCompetences: true,
        })
        .withLearningContent([
          {
            id: 'areaA',
            frameworkId: 'frameworkA',
            code: 'code Domaine A',
            title: 'title FR Domaine A',
            color: 'color Domaine A',
            competences: [
              {
                id: 'competenceA',
                name: 'name FR Competence A',
                index: 'index Competence A',
                thematics: [
                  {
                    id: 'thematicA',
                    name: 'name FR Thematic A',
                    index: 1,
                    tubes: [
                      {
                        id: 'tubeA',
                        name: 'Titre pratique Tube A',
                        practicalTitle: 'practicalTitle FR Tube A',
                        mobile: true,
                        tablet: false,
                        skills: [
                          {
                            id: 'skillA',
                            difficulty: 2,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'areaB',
            frameworkId: 'frameworkB',
            code: 'code Domaine B',
            title: 'title FR Domaine B',
            color: 'color Domaine B',
            competences: [
              {
                id: 'competenceB',
                name: 'name FR Competence B',
                index: 'index Competence B',
                thematics: [
                  {
                    id: 'thematicB',
                    name: 'name FR Thematic B',
                    index: 2,
                    tubes: [
                      {
                        id: 'tubeB',
                        name: 'Titre pratique Tube B',
                        practicalTitle: 'practicalTitle FR Tube B',
                        mobile: false,
                        tablet: true,
                        skills: [
                          {
                            id: 'skillB',
                            difficulty: 6,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ])
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      const versionDetails = await versionDetailsRepository.getById(123);

      // then
      expect(versionDetails).to.deepEqualInstance(expectedVersionDetails);
    });
  });
});
