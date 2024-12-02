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

      const lcmsClient = {
        getLatestRelease: sinon.stub().resolves({
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
      };

      const frameworkRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };
      const areaRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };
      const competenceRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };
      const thematicRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };
      const tubeRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };
      const skillRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };
      const challengeRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };
      const courseRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };
      const tutorialRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };
      const missionRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
      };

      // when
      await refreshLearningContentCache({
        lcmsClient,
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
      expect(lcmsClient.getLatestRelease).to.have.been.calledOnce;
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
      expect(frameworkRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(areaRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(competenceRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(thematicRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(tubeRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(skillRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(challengeRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(courseRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(tutorialRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(missionRepository.clearCache).to.have.been.calledOnceWithExactly();
    });
  });
});
