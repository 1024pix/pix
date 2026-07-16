import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import * as versionDetailsRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/version-details-repository.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Repository | Version Details', function () {
  describe('#getById', function () {
    it('returns null when version is not found', async function () {
      // given
      databaseBuilder.factory.buildCertificationVersion({
        id: 123,
        scope: SCOPES.PIX_PLUS_PRO_SANTE,
        startDate: new Date('2020-01-01'),
        expirationDate: null,
        status: VERSION_STATUSES.ACTIVE,
        comments: 'Salut les zamis',
        minimumAnswersRequiredToValidateACertification: 12,
        assessmentDuration: 25,
        challengesConfiguration: {
          maximumAssessmentLength: 50,
        },
      });
      databaseBuilder.factory.buildCertificationVersionTube({
        tubeId: 'tubeA',
        versionId: 123,
      });
      await databaseBuilder.commit();

      // when
      const versionDetails = await versionDetailsRepository.getById(456);

      // then
      expect(versionDetails).to.be.null;
    });

    it('returns a VersionDetails model when it exists', async function () {
      // given
      databaseBuilder.factory.buildCertificationVersion({
        id: 123,
        scope: SCOPES.PIX_PLUS_PRO_SANTE,
        startDate: new Date('2020-01-01'),
        expirationDate: null,
        status: VERSION_STATUSES.ACTIVE,
        comments: 'Salut les zamis',
        minimumAnswersRequiredToValidateACertification: 12,
        assessmentDuration: 25,
        challengesConfiguration: {
          maximumAssessmentLength: 50,
        },
      });
      databaseBuilder.factory.buildCertificationVersionTube({
        tubeId: 'tubeA',
        versionId: 123,
      });
      databaseBuilder.factory.buildCertificationVersionTube({
        tubeId: 'tubeB',
        versionId: 123,
      });
      createLearningContent();
      await databaseBuilder.commit();

      // when
      const versionDetails = await versionDetailsRepository.getById(123);

      // then
      expect(versionDetails).to.deepEqualInstance(
        domainBuilder.certification.configuration.buildVersionDetails({
          id: 123,
          startDate: new Date('2020-01-01'),
          expirationDate: null,
          status: VERSION_STATUSES.ACTIVE,
          comments: 'Salut les zamis',
          minimumAnswersRequiredForValidation: 12,
          assessmentDuration: 25,
          maximumAssessmentLength: 50,
          areas: [
            {
              id: 'areaA',
              frameworkId: 'frameworkA',
              code: 'code Domaine A',
              title: 'title FR Domaine A',
              color: 'color Domaine A',
              competences: [
                {
                  id: 'competenceA',
                  areaId: 'areaA',
                  name: 'name FR Competence A',
                  index: 'index Competence A',
                  thematics: [
                    {
                      id: 'thematicA',
                      competenceId: 'competenceA',
                      name: 'name FR Thematic A',
                      index: 1,
                      tubes: [
                        {
                          id: 'tubeA',
                          thematicId: 'thematicA',
                          competenceId: 'competenceA',
                          name: 'Titre pratique Tube A',
                          practicalTitle: 'practicalTitle FR Tube A',
                          mobile: true,
                          tablet: false,
                          skills: [
                            {
                              id: 'skillA',
                              tubeId: 'tubeA',
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
                  areaId: 'areaB',
                  name: 'name FR Competence B',
                  index: 'index Competence B',
                  thematics: [
                    {
                      id: 'thematicB',
                      competenceId: 'competenceB',
                      name: 'name FR Thematic B',
                      index: 2,
                      tubes: [
                        {
                          id: 'tubeB',
                          thematicId: 'thematicB',
                          competenceId: 'competenceB',
                          name: 'Titre pratique Tube B',
                          practicalTitle: 'practicalTitle FR Tube B',
                          mobile: false,
                          tablet: true,
                          skills: [
                            {
                              id: 'skillB',
                              tubeId: 'tubeB',
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
          ],
        }),
      );
    });
  });
});

function createLearningContent() {
  databaseBuilder.factory.learningContent.buildFramework({
    id: 'frameworkA',
  });
  databaseBuilder.factory.learningContent.buildFramework({
    id: 'frameworkB',
  });
  databaseBuilder.factory.learningContent.buildArea({
    id: 'areaA',
    frameworkId: 'frameworkA',
    code: 'code Domaine A',
    title_i18n: { fr: 'title FR Domaine A' },
    color: 'color Domaine A',
  });
  databaseBuilder.factory.learningContent.buildArea({
    id: 'areaB',
    frameworkId: 'frameworkB',
    code: 'code Domaine B',
    title_i18n: { fr: 'title FR Domaine B' },
    color: 'color Domaine B',
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'competenceA',
    areaId: 'areaA',
    name_i18n: { fr: 'name FR Competence A' },
    index: 'index Competence A',
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'competenceB',
    areaId: 'areaB',
    name_i18n: { fr: 'name FR Competence B' },
    index: 'index Competence B',
  });
  databaseBuilder.factory.learningContent.buildThematic({
    id: 'thematicA',
    competenceId: 'competenceA',
    name_i18n: { fr: 'name FR Thematic A' },
    index: 1,
  });
  databaseBuilder.factory.learningContent.buildThematic({
    id: 'thematicB',
    competenceId: 'competenceB',
    name_i18n: { fr: 'name FR Thematic B' },
    index: 2,
  });
  databaseBuilder.factory.learningContent.buildTube({
    id: 'tubeA',
    thematicId: 'thematicA',
    competenceId: 'competenceA',
    name: 'Titre pratique Tube A',
    practicalTitle_i18n: { fr: 'practicalTitle FR Tube A' },
    isMobileCompliant: true,
    isTabletCompliant: false,
    skillIds: ['skillA'],
  });
  databaseBuilder.factory.learningContent.buildTube({
    id: 'tubeB',
    thematicId: 'thematicB',
    competenceId: 'competenceB',
    name: 'Titre pratique Tube B',
    practicalTitle_i18n: { fr: 'practicalTitle FR Tube B' },
    isMobileCompliant: false,
    isTabletCompliant: true,
    skillIds: ['skillB'],
  });
  databaseBuilder.factory.learningContent.buildSkill({
    id: 'skillA',
    tubeId: 'tubeA',
    level: 2,
  });
  databaseBuilder.factory.learningContent.buildSkill({
    id: 'skillB',
    tubeId: 'tubeB',
    level: 6,
  });
}
