const { expect, databaseBuilder, mockLearningContent, domainBuilder, catchErr } = require('../../../test-helper');
const { CertifiedProfile } = require('../../../../lib/domain/read-models/CertifiedProfile');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const certifiedProfileRepository = require('../../../../lib/infrastructure/repositories/certified-profile-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Certified Profile', () => {

  describe('#get', () => {

    it('should return certified profile fill with skills validated by the user before certification date', async () => {
      // given
      const learningContent = {
        areas: [{
          id: 'recArea1',
          titleFrFr: 'area1_Title',
          color: 'someColor',
          competenceIds: ['recArea1_Competence1', 'recArea1_Competence2'],
        }],
        competences: [{
          id: 'recArea1_Competence1',
          nameFrFr: 'competence1_1_name',
          index: 'competence1_1_index',
          areaId: 'recArea1',
          skillIds: ['recArea1_Competence1_Tube1_Skill2'],
          origin: 'Pix',
        }, {
          id: 'recArea1_Competence2',
          nameFrFr: 'competence1_2_name',
          index: 'competence1_2_index',
          areaId: 'recArea1',
          skillIds: ['recArea1_Competence2_Tube1_Skill1'],
          origin: 'Pix',
        }],
        tubes: [{
          id: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
          practicalTitleFrFr: 'tube1_1_1_practicalTitle',
        }, {
          id: 'recArea1_Competence2_Tube1',
          competenceId: 'recArea1_Competence2',
          practicalTitleFrFr: 'tube1_2_1_practicalTitle',
        }],
        skills: [{
          id: 'recArea1_Competence1_Tube1_Skill1',
          name: 'skill1_1_1_1_name',
          status: 'actif',
          tubeId: 'recArea1_Competence2_Tube1',
          competenceId: 'recArea1_Competence2',
          tutorialIds: [],
        }, {
          id: 'recArea1_Competence1_Tube1_Skill2',
          name: 'skill1_1_1_2_name',
          status: 'périmé',
          tubeId: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
          tutorialIds: [],
        }, {
          id: 'recArea1_Competence2_Tube1_Skill1',
          name: 'skill1_2_1_1_name',
          status: 'actif',
          tubeId: 'recArea1_Competence2_Tube1',
          competenceId: 'recArea1_Competence2',
          tutorialIds: [],
        }],
      };
      const skill1_1_1_2 = domainBuilder.buildCertifiedSkill({
        id: 'recArea1_Competence1_Tube1_Skill2',
        name: 'skill1_1_1_2_name',
        hasBeenAskedInCertif: false,
        tubeId: 'recArea1_Competence1_Tube1',
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
      });
      const area1 = domainBuilder.buildCertifiedArea({
        id: 'recArea1',
        name: 'area1_Title',
      });
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId, createdAt: new Date('2020-01-01') }).id;
      databaseBuilder.factory.buildCertificationCourse({ userId });
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
        status: KnowledgeElement.StatusType.INVALIDATED,
        skillId: 'recArea1_Competence2_Tube1_Skill1',
        competenceId: 'recArea1_Competence2',
      });
      databaseBuilder.factory.buildCertificationChallenge({ courseId: certificationCourseId });
      const expectedCertifiedProfile = domainBuilder.buildCertifiedProfile({
        id: certificationCourseId,
        userId,
        certifiedSkills: [skill1_1_1_2],
        certifiedTubes: [tube1_1_1],
        certifiedCompetences: [competence1_1],
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

    it('should mark the certifiedSkill that were actually asked in certification test as it', async () => {
      // given
      const learningContent = {
        areas: [{
          id: 'recArea1',
          titleFrFr: 'area1_Title',
          color: 'someColor',
          competenceIds: ['recArea1_Competence1', 'recArea1_Competence2'],
        }],
        competences: [{
          id: 'recArea1_Competence1',
          nameFrFr: 'competence1_1_name',
          index: 'competence1_1_index',
          areaId: 'recArea1',
          skillIds: ['recArea1_Competence1_Tube1_Skill2'],
          origin: 'Pix',
        }, {
          id: 'recArea1_Competence2',
          nameFrFr: 'competence1_2_name',
          index: 'competence1_2_index',
          areaId: 'recArea1',
          skillIds: ['recArea1_Competence2_Tube1_Skill1'],
          origin: 'Pix',
        }],
        tubes: [{
          id: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
          practicalTitleFrFr: 'tube1_1_1_practicalTitle',
        }, {
          id: 'recArea1_Competence2_Tube1',
          competenceId: 'recArea1_Competence2',
          practicalTitleFrFr: 'tube1_2_1_practicalTitle',
        }],
        skills: [{
          id: 'recArea1_Competence1_Tube1_Skill1',
          name: 'skill1_1_1_1_name',
          status: 'actif',
          tubeId: 'recArea1_Competence2_Tube1',
          competenceId: 'recArea1_Competence2',
          tutorialIds: [],
        }, {
          id: 'recArea1_Competence1_Tube1_Skill2',
          name: 'skill1_1_1_2_name',
          status: 'périmé',
          tubeId: 'recArea1_Competence1_Tube1',
          competenceId: 'recArea1_Competence1',
          tutorialIds: [],
        }, {
          id: 'recArea1_Competence2_Tube1_Skill1',
          name: 'skill1_2_1_1_name',
          status: 'actif',
          tubeId: 'recArea1_Competence2_Tube1',
          competenceId: 'recArea1_Competence2',
          tutorialIds: [],
        }],
      };
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId, createdAt: new Date('2020-01-01') }).id;
      databaseBuilder.factory.buildCertificationCourse({ userId });
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
      const certifiedSkill1_1_1_2 = certifiedProfile.certifiedSkills.find((skill) => skill.id === 'recArea1_Competence1_Tube1_Skill2');
      const certifiedSkill1_2_1_1 = certifiedProfile.certifiedSkills.find((skill) => skill.id === 'recArea1_Competence2_Tube1_Skill1');
      expect(certifiedSkill1_1_1_2.hasBeenAskedInCertif).to.be.true;
      expect(certifiedSkill1_2_1_1.hasBeenAskedInCertif).to.be.false;
    });

    it('should throw a NotFoundError when related certification course does not exists', async () => {
      // when
      const error = await catchErr(certifiedProfileRepository.get)(123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw a NotFoundError when related certification course has no certification challenges', async () => {
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
