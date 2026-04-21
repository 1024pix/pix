import sinon from 'sinon';

import { patchLearningContentCacheEntry } from '../../../../../src/learning-content/domain/usecases/patch-learning-content-cache-entry.js';

describe('Learning Content | Unit | Domain | Usecase | Patch learning content cache entry', function () {
  let frameworkRepository,
    areaRepository,
    competenceRepository,
    thematicRepository,
    tubeRepository,
    skillRepository,
    challengeRepository,
    courseRepository,
    tutorialRepository,
    missionRepository;
  let repositories;
  let repositoriesByModel;

  beforeEach(function () {
    frameworkRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    areaRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    competenceRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    thematicRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    tubeRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    skillRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    challengeRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    courseRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    tutorialRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    missionRepository = {
      save: sinon.stub().rejects('should not be called'),
      clearCache: sinon.stub().rejects('should not be called'),
    };
    repositories = {
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
    };
    repositoriesByModel = {
      frameworks: frameworkRepository,
      areas: areaRepository,
      competences: competenceRepository,
      thematics: thematicRepository,
      tubes: tubeRepository,
      skills: skillRepository,
      challenges: challengeRepository,
      courses: courseRepository,
      tutorials: tutorialRepository,
      missions: missionRepository,
    };
  });

  describe('#patchLearningContentCacheEntry', function () {
    [
      'frameworks',
      'areas',
      'competences',
      'thematics',
      'tubes',
      'skills',
      'challenges',
      'courses',
      'tutorials',
      'missions',
    ].forEach((modelName) => {
      describe(`when model is ${modelName}`, function () {
        const recordId = 'recId';
        const updatedRecord = Symbol('updated record');

        beforeEach(function () {
          repositoriesByModel[modelName].save.withArgs(updatedRecord).resolves();
          repositoriesByModel[modelName].clearCache.withArgs(recordId).returns();
        });

        it(`should call save and clearCache on appropriate repository`, async function () {
          // when
          await patchLearningContentCacheEntry({
            recordId,
            updatedRecord,
            modelName,
            ...repositories,
          });

          // then
          expect(repositoriesByModel[modelName].save).to.have.been.calledOnceWithExactly(updatedRecord);
          expect(repositoriesByModel[modelName].clearCache).to.have.been.calledOnceWithExactly(recordId);
        });
      });
    });
  });
});
