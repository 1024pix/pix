import { expect, databaseBuilder, mockLearningContent, domainBuilder, catchErr } from '../../../test-helper';
import { CertifiedProfile } from '../../../../lib/domain/read-models/CertifiedProfile';
import KnowledgeElement from '../../../../lib/domain/models/KnowledgeElement';
import certifiedProfileRepository from '../../../../lib/infrastructure/repositories/certified-profile-repository';
import { NotFoundError } from '../../../../lib/domain/errors';

describe('Integration | Repository | Certified Profile', function () {
  describe('#get', function () {
    it('should return certified profile fill with skills validated by the user before certification date', async function () {
      // given
      const learningContent = {
        areas: [
          {
            id: 'recArea1',
            title_i18n: {
              fr: 'area1_Title',
            },
            color: 'someColor',
            competenceIds: ['recArea1_Competence1', 'recArea1_Competence2'],
          },
        ],
        competences: [
          {
            id: 'recArea1_Competence1',
            name_i18n: {
              fr: 'competence1_1_name',
            },
            index: 'competence1_1_index',
            areaId: 'recArea1',
            skillIds: ['recArea1_Competence1_Tube1_Skill2'],
            origin: 'Pix',
          },
          {
            id: 'recArea1_Competence2',
            name_i18n: {
              fr: 'competence1_2_name',
            },
            index: 'competence1_2_index',
            areaId: 'recArea1',
            skillIds: ['recArea1_Competence2_Tube1_Skill1'],
            origin: 'Edu',
          },
        ],
        tubes: [
          {
            id: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            practicalTitle_i18n: {
              fr: 'tube1_1_1_practicalTitle',
            },
          },
          {
            id: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            practicalTitle_i18n: {
              fr: 'tube1_2_1_practicalTitle',
            },
          },
        ],
        skills: [
          {
            id: 'recArea1_Competence1_Tube1_Skill1',
            name: 'skill1_1_1_1_name',
            status: 'actif',
            tubeId: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            tutorialIds: [],
            level: 1,
          },
          {
            id: 'recArea1_Competence1_Tube1_Skill2',
            name: 'skill1_1_1_2_name',
            status: 'périmé',
            tubeId: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            tutorialIds: [],
            level: 2,
          },
          {
            id: 'recArea1_Competence2_Tube1_Skill1',
            name: 'skill1_2_1_1_name',
            status: 'actif',
            tubeId: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            tutorialIds: [],
            level: 3,
          },
        ],
      };
      const skill1_1_1_2 = domainBuilder.buildCertifiedSkill({
        id: 'recArea1_Competence1_Tube1_Skill2',
        name: 'skill1_1_1_2_name',
        hasBeenAskedInCertif: false,
        tubeId: 'recArea1_Competence1_Tube1',
        difficulty: 2,
      });
      const tube1_1_1 = domainBuilder.buildCertifiedTube({
        id: 'recArea1_Competence1_Tube1',
        name: 'tube1_1_1_practicalTitle',
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
        name: 'area1_Title',
      });

      const skill1_2_1_1 = domainBuilder.buildCertifiedSkill({
        id: 'recArea1_Competence2_Tube1_Skill1',
        name: 'skill1_2_1_1_name',
        hasBeenAskedInCertif: false,
        tubeId: 'recArea1_Competence2_Tube1',
        difficulty: 3,
      });
      const tube1_2_1 = domainBuilder.buildCertifiedTube({
        id: 'recArea1_Competence2_Tube1',
        name: 'tube1_2_1_practicalTitle',
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
        skillId: 'recArea1_Competence1_Tube1_Skill2',
        competenceId: 'recArea1_Competence1',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2021-01-01'),
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recArea1_Competence1_Tube1_Skill1',
        competenceId: 'recArea1_Competence1',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-01-01'),
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recArea1_Competence2_Tube1_Skill1',
        competenceId: 'recArea1_Competence2',
      });
      databaseBuilder.factory.buildCertificationChallenge({ courseId: 4567 });
      databaseBuilder.factory.buildCertificationChallenge({ courseId: certificationCourseId });
      const expectedCertifiedProfile = domainBuilder.buildCertifiedProfile({
        id: certificationCourseId,
        userId,
        certifiedSkills: [skill1_1_1_2, skill1_2_1_1],
        certifiedTubes: [tube1_1_1, tube1_2_1],
        certifiedCompetences: [competence1_1, competence1_2],
        certifiedAreas: [area1],
      });
      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      // when
      const certifiedProfile = await certifiedProfileRepository.get(certificationCourseId);

      // then
      expect(certifiedProfile).to.be.instanceOf(CertifiedProfile);
      expect(certifiedProfile).to.deep.equal(expectedCertifiedProfile);
    });

    it('should mark the certifiedSkill that were actually asked in certification test as it', async function () {
      // given
      const learningContent = {
        areas: [
          {
            id: 'recArea1',
            title_i18n: {
              fr: 'area1_Title',
            },
            color: 'someColor',
            competenceIds: ['recArea1_Competence1', 'recArea1_Competence2'],
          },
        ],
        competences: [
          {
            id: 'recArea1_Competence1',
            name_i18n: {
              fr: 'competence1_1_name',
            },
            index: 'competence1_1_index',
            areaId: 'recArea1',
            skillIds: ['recArea1_Competence1_Tube1_Skill2'],
            origin: 'Pix',
          },
          {
            id: 'recArea1_Competence2',
            name_i18n: {
              fr: 'competence1_2_name',
            },
            index: 'competence1_2_index',
            areaId: 'recArea1',
            skillIds: ['recArea1_Competence2_Tube1_Skill1'],
            origin: 'Edu',
          },
        ],
        tubes: [
          {
            id: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            practicalTitle_i18n: {
              fr: 'tube1_1_1_practicalTitle',
            },
          },
          {
            id: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            practicalTitle_i18n: {
              fr: 'tube1_2_1_practicalTitle',
            },
          },
        ],
        skills: [
          {
            id: 'recArea1_Competence1_Tube1_Skill1',
            name: 'skill1_1_1_1_name',
            status: 'actif',
            tubeId: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            tutorialIds: [],
          },
          {
            id: 'recArea1_Competence1_Tube1_Skill2',
            name: 'skill1_1_1_2_name',
            status: 'périmé',
            tubeId: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
            tutorialIds: [],
          },
          {
            id: 'recArea1_Competence2_Tube1_Skill1',
            name: 'skill1_2_1_1_name',
            status: 'actif',
            tubeId: 'recArea1_Competence2_Tube1',
            competenceId: 'recArea1_Competence2',
            tutorialIds: [],
          },
        ],
      };
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
        skillId: 'recArea1_Competence1_Tube1_Skill2',
        competenceId: 'recArea1_Competence1',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2019-01-01'),
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: 'recArea1_Competence2_Tube1_Skill1',
        competenceId: 'recArea1_Competence2',
      });
      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        associatedSkillId: 'recArea1_Competence1_Tube1_Skill2',
      });

      mockLearningContent(learningContent);
      await databaseBuilder.commit();

      // when
      const certifiedProfile = await certifiedProfileRepository.get(certificationCourseId);

      // then
      const certifiedSkill1_1_1_2 = certifiedProfile.certifiedSkills.find(
        (skill) => skill.id === 'recArea1_Competence1_Tube1_Skill2'
      );
      const certifiedSkill1_2_1_1 = certifiedProfile.certifiedSkills.find(
        (skill) => skill.id === 'recArea1_Competence2_Tube1_Skill1'
      );
      expect(certifiedSkill1_1_1_2.hasBeenAskedInCertif).to.be.true;
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
