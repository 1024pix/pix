import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { refreshLearningContentCache } from '../../../../../src/learning-content/domain/usecases/refresh-learning-content-cache.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Learning Content | Unit | Domain | Usecase | Refresh learning content cache', function () {
  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
  });

  describe('#refreshLearningContentCache', function () {
    it('should trigger a reset of the learning content cache', async function () {
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
          reset: sinon.stub().resolves({
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
        save: sinon.stub(),
      };
      const areaRepository = {
        save: sinon.stub(),
      };
      const competenceRepository = {
        save: sinon.stub(),
      };
      const thematicRepository = {
        save: sinon.stub(),
      };
      const tubeRepository = {
        save: sinon.stub(),
      };
      const skillRepository = {
        save: sinon.stub(),
      };
      const challengeRepository = {
        save: sinon.stub(),
      };
      const courseRepository = {
        save: sinon.stub(),
      };
      const tutorialRepository = {
        save: sinon.stub(),
      };
      const missionRepository = {
        save: sinon.stub(),
      };

      // when
      await refreshLearningContentCache({
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
      expect(LearningContentCache.instance.reset).to.have.been.calledOnce;
      expect(frameworkRepository.save).to.have.been.calledOnceWithExactly(frameworks);
      expect(areaRepository.save).to.have.been.calledOnceWithExactly(areas);
      expect(competenceRepository.save).to.have.been.calledOnceWithExactly(competences);
      expect(thematicRepository.save).to.have.been.calledOnceWithExactly(thematics);
      expect(tubeRepository.save).to.have.been.calledOnceWithExactly(tubes);
      expect(skillRepository.save).to.have.been.calledOnceWithExactly(skills);
      expect(challengeRepository.save).to.have.been.calledOnceWithExactly(challenges);
      expect(courseRepository.save).to.have.been.calledOnceWithExactly(courses);
      expect(tutorialRepository.save).to.have.been.calledOnceWithExactly(tutorials);
      expect(missionRepository.save).to.have.been.calledOnceWithExactly(missions);
    });
  });
});
