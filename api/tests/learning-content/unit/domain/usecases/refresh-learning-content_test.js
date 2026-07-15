import sinon from 'sinon';

import { refreshLearningContent } from '../../../../../src/learning-content/domain/usecases/refresh-learning-content.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../../test-helper.js';

describe('Learning Content | Unit | Domain | Usecase | Refresh learning content', function () {
  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });
  });

  describe('#refreshLearningContent', function () {
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
      const modules = [
        // cas de recette
        { id: 'moduleA', version: '1.0' },
        { id: 'moduleB', version: '2.0' },
        { id: 'moduleC', version: '1.0' },

        // cas de prod
        { id: 'moduleD', version: '3.0' },
        { id: 'moduleE', version: '1.0' },
      ];

      const lcmsClient = {
        getRelease: sinon.stub().resolves({
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
          modules,
        }),
      };

      const frameworkRepository = {
        saveMany: sinon.stub(),
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
      const moduleRepository = {
        saveMany: sinon.stub(),
        clearCache: sinon.stub(),
        list: sinon.stub().resolves([
          // cas de recette
          { id: 'moduleA', version: '1.1' },
          { id: 'moduleB', version: '2.0' },
          { id: 'moduleC', version: '0.2' },

          // cas de prod
          { id: 'moduleD', version: '2.0' },
        ]),
      };

      // when
      await refreshLearningContent({
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
        moduleRepository,
      });

      // then
      expect(lcmsClient.getRelease).to.have.been.calledOnce;

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
      expect(moduleRepository.list).to.have.been.calledOnce;
      expect(moduleRepository.saveMany).to.have.been.calledOnceWith([
        // cas de recette
        { id: 'moduleC', version: '1.0' },

        // cas de prod
        { id: 'moduleD', version: '3.0' },
        { id: 'moduleE', version: '1.0' },
      ]);

      expect(areaRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(competenceRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(thematicRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(tubeRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(skillRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(challengeRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(courseRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(tutorialRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(missionRepository.clearCache).to.have.been.calledOnceWithExactly();
      expect(moduleRepository.clearCache).to.have.been.calledOnceWithExactly();
    });
  });
});
