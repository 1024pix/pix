const {
  expect,
  databaseBuilder,
  mockLearningContent,
  domainBuilder,
  catchErr,
  learningContentBuilder,
} = require('../../../test-helper');
const { CertifiedProfile } = require('../../../../lib/domain/read-models/CertifiedProfile');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const certifiedProfileRepository = require('../../../../lib/infrastructure/repositories/certified-profile-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Certified Profile', function () {
  describe('#get', function () {
    it('should return certified profile fill with skills validated by the user before certification date', async function () {
      // given
      _buildAndMockLearningContent();
      const skill1_1_1_1_2 = domainBuilder.buildCertifiedSkill({
        id: 'recArea1_Competence1_Thematic1_Tube1_Skill2',
        name: 'skill1_1_1_1_2_name',
        hasBeenAskedInCertif: false,
        tubeId: 'recArea1_Competence1_Thematic1_Tube1',
        difficulty: 2,
      });
      const tube1_1_1_1 = domainBuilder.buildCertifiedTube({
        id: 'recArea1_Competence1_Thematic1_Tube1',
        name: 'tube1_1_1_1_practicalTitle',
        competenceId: 'recArea1_Competence1',
      });
      const competence1_1 = domainBuilder.buildCertifiedCompetence({
        id: 'recArea1_Competence1',
        name: 'competence1_1_name',
        areaId: 'recArea1',
        origin: 'Pix',
      });
      const area1 = domainBuilder.buildCertifiedArea({
        id: 'recArea1',
        name: 'area1_title',
        color: 'area1_color',
      });

      const skill1_2_1_1_1 = domainBuilder.buildCertifiedSkill({
        id: 'recArea1_Competence2_Thematic1_Tube1_Skill1',
        name: 'skill1_2_1_1_1_name',
        hasBeenAskedInCertif: false,
        tubeId: 'recArea1_Competence2_Thematic1_Tube1',
        difficulty: 3,
      });
      const tube1_2_1_1 = domainBuilder.buildCertifiedTube({
        id: 'recArea1_Competence2_Thematic1_Tube1',
        name: 'tube1_2_1_1_practicalTitle',
        competenceId: 'recArea1_Competence2',
      });
      const competence1_2 = domainBuilder.buildCertifiedCompetence({
        id: 'recArea1_Competence2',
        name: 'competence1_2_name',
        areaId: 'recArea1',
        origin: 'Edu',
      });

      const userId = databaseBuilder.factory.buildUser({ id: 123 }).id;
      databaseBuilder.factory.buildUser({ id: 456 });
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        id: 1234,
        userId,
        createdAt: new Date('2020-01-01'),
      }).id;

      databaseBuilder.factory.buildCertificationCourse({
        id: 4567,
        userId: 456,
        createdAt: new Date('2020-01-01'),
      }).id;

      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-01-01'),
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recArea1_Competence1_Thematic1_Tube1_Skill2',
        competenceId: 'recArea1_Competence1',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2021-01-01'),
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recArea1_Competence1_Thematic1_Tube1_Skill1',
        competenceId: 'recArea1_Competence1',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-01-01'),
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recArea1_Competence2_Thematic1_Tube1_Skill1',
        competenceId: 'recArea1_Competence2',
      });
      databaseBuilder.factory.buildCertificationChallenge({ courseId: 4567 });
      databaseBuilder.factory.buildCertificationChallenge({ courseId: certificationCourseId });
      const expectedCertifiedProfile = domainBuilder.buildCertifiedProfile({
        id: certificationCourseId,
        userId,
        certifiedSkills: [skill1_1_1_1_2, skill1_2_1_1_1],
        certifiedTubes: [tube1_1_1_1, tube1_2_1_1],
        certifiedCompetences: [competence1_1, competence1_2],
        certifiedAreas: [area1],
      });
      await databaseBuilder.commit();

      // when
      const certifiedProfile = await certifiedProfileRepository.get(certificationCourseId);

      // then
      expect(certifiedProfile).to.be.instanceOf(CertifiedProfile);
      expect(certifiedProfile).to.deep.equal(expectedCertifiedProfile);
    });

    it('should mark the certifiedSkill that were actually asked in certification test as it', async function () {
      // given
      _buildAndMockLearningContent();
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        id: 12345,
        userId,
        createdAt: new Date('2020-01-01'),
      }).id;

      databaseBuilder.factory.buildCertificationCourse({
        id: 1234,
        userId,
        createdAt: new Date('2020-01-01'),
      });

      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-01-01'),
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recArea1_Competence1_Thematic1_Tube1_Skill2',
        competenceId: 'recArea1_Competence1',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-01-01'),
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recArea1_Competence2_Thematic1_Tube1_Skill1',
        competenceId: 'recArea1_Competence2',
      });
      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        associatedSkillId: 'recArea1_Competence1_Thematic1_Tube1_Skill2',
      });

      await databaseBuilder.commit();

      // when
      const certifiedProfile = await certifiedProfileRepository.get(certificationCourseId);

      // then
      const certifiedskill1_1_1_1_2 = certifiedProfile.certifiedSkills.find(
        (skill) => skill.id === 'recArea1_Competence1_Thematic1_Tube1_Skill2'
      );
      const certifiedSkill1_2_1_1 = certifiedProfile.certifiedSkills.find(
        (skill) => skill.id === 'recArea1_Competence2_Thematic1_Tube1_Skill1'
      );
      expect(certifiedskill1_1_1_1_2.hasBeenAskedInCertif).to.be.true;
      expect(certifiedSkill1_2_1_1.hasBeenAskedInCertif).to.be.false;
    });

    it('should throw a NotFoundError when related certification course does not exists', async function () {
      // when
      const error = await catchErr(certifiedProfileRepository.get)(123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw a NotFoundError when related certification course has no certification challenges', async function () {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certifiedProfileRepository.get)(certificationCourseId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});

function _buildAndMockLearningContent() {
  const learningContent = learningContentBuilder.buildLearningContent([
    {
      id: 'recFramework1',
      name: 'Mon référentiel 1',
      areas: [
        {
          id: 'recArea1',
          titleFr: 'area1_title',
          color: 'area1_color',
          frameworkId: 'recFramework1',
          competences: [
            {
              id: 'recArea1_Competence1',
              nameFr: 'competence1_1_name',
              origin: 'Pix',
              thematics: [
                {
                  id: 'recArea1_Competence1_Thematic1',
                  tubes: [
                    {
                      id: 'recArea1_Competence1_Thematic1_Tube1',
                      practicalTitleFr: 'tube1_1_1_1_practicalTitle',
                      skills: [
                        {
                          id: 'recArea1_Competence1_Thematic1_Tube1_Skill1',
                          name: 'skill1_1_1_1_1_name',
                          status: 'actif',
                          level: 1,
                        },
                        {
                          id: 'recArea1_Competence1_Thematic1_Tube1_Skill2',
                          name: 'skill1_1_1_1_2_name',
                          status: 'périmé',
                          level: 2,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recArea1_Competence2',
              nameFr: 'competence1_2_name',
              origin: 'Edu',
              thematics: [
                {
                  id: 'recArea1_Competence2_Thematic1',
                  tubes: [
                    {
                      id: 'recArea1_Competence2_Thematic1_Tube1',
                      practicalTitleFr: 'tube1_2_1_1_practicalTitle',
                      skills: [
                        {
                          id: 'recArea1_Competence2_Thematic1_Tube1_Skill1',
                          name: 'skill1_2_1_1_1_name',
                          status: 'actif',
                          level: 3,
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
    },
  ]);
  mockLearningContent(learningContent);
}
