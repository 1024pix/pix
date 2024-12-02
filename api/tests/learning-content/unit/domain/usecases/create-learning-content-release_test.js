import { createLearningContentRelease } from '../../../../../src/learning-content/domain/usecases/create-learning-content-release.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Learning Content | Unit | UseCase | create-learning-content-release', function () {
  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
  });

  describe('#createLearningContentRelease', function () {
    it('should trigger an update of the learning content cache', async function () {
      // given
      const frameworks = Symbol('frameworks');
      const areas = Symbol('areas');
      const competences = Symbol('competences');
      const thematics = Symbol('thematics');
      const tubes = Symbol('tubes');
      const skills = Symbol('skills');
      const challenges = Symbol('challenges');
      const courses = Symbol('courses');
      const tutorials = Symbol('tutorials');
      const missions = Symbol('missions');

      const LearningContentCache = {
        instance: {
          update: sinon.stub().resolves({
            frameworks,
            areas,
            competences,
            thematics,
            tubes,
            skills,
            challenges,
            courses,
            tutorials,
            missions,
          }),
        },
      };

      const frameworkRepository = {
        saveMany: sinon.stub(),
      };
      const areaRepository = {
        saveMany: sinon.stub(),
      };
      const competenceRepository = {
        saveMany: sinon.stub(),
      };
      const thematicRepository = {
        saveMany: sinon.stub(),
      };
      const tubeRepository = {
        saveMany: sinon.stub(),
      };
      const skillRepository = {
        saveMany: sinon.stub(),
      };
      const challengeRepository = {
        saveMany: sinon.stub(),
      };
      const courseRepository = {
        saveMany: sinon.stub(),
      };
      const tutorialRepository = {
        saveMany: sinon.stub(),
      };
      const missionRepository = {
        saveMany: sinon.stub(),
      };

      // when
      await createLearningContentRelease({
        LearningContentCache,
        frameworkRepository,
        areaRepository,
        competenceRepository,
        thematicRepository,
        tubeRepository,
        skillRepository,
        challengeRepository,
        courseRepository,
        tutorialRepository,
        missionRepository,
      });

      // then
      expect(LearningContentCache.instance.update).to.have.been.calledOnce;
      expect(frameworkRepository.saveMany).to.have.been.calledOnceWithExactly(frameworks);
      expect(areaRepository.saveMany).to.have.been.calledOnceWithExactly(areas);
      expect(competenceRepository.saveMany).to.have.been.calledOnceWithExactly(competences);
      expect(thematicRepository.saveMany).to.have.been.calledOnceWithExactly(thematics);
      expect(tubeRepository.saveMany).to.have.been.calledOnceWithExactly(tubes);
      expect(skillRepository.saveMany).to.have.been.calledOnceWithExactly(skills);
      expect(challengeRepository.saveMany).to.have.been.calledOnceWithExactly(challenges);
      expect(courseRepository.saveMany).to.have.been.calledOnceWithExactly(courses);
      expect(tutorialRepository.saveMany).to.have.been.calledOnceWithExactly(tutorials);
      expect(missionRepository.saveMany).to.have.been.calledOnceWithExactly(missions);
    });
  });
});
