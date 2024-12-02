import { patchLearningContentCacheEntry } from '../../../../../src/learning-content/domain/usecases/patch-learning-content-cache-entry.js';
import { expect, sinon } from '../../../../test-helper.js';

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
      save: sinon.stub(),
    };
    frameworkRepository.save.rejects('I should not be called');
    areaRepository = {
      save: sinon.stub(),
    };
    areaRepository.save.rejects('I should not be called');
    competenceRepository = {
      save: sinon.stub(),
    };
    competenceRepository.save.rejects('I should not be called');
    thematicRepository = {
      save: sinon.stub(),
    };
    thematicRepository.save.rejects('I should not be called');
    tubeRepository = {
      save: sinon.stub(),
    };
    tubeRepository.save.rejects('I should not be called');
    skillRepository = {
      save: sinon.stub(),
    };
    skillRepository.save.rejects('I should not be called');
    challengeRepository = {
      save: sinon.stub(),
    };
    challengeRepository.save.rejects('I should not be called');
    courseRepository = {
      save: sinon.stub(),
    };
    courseRepository.save.rejects('I should not be called');
    tutorialRepository = {
      save: sinon.stub(),
    };
    tutorialRepository.save.rejects('I should not be called');
    missionRepository = {
      save: sinon.stub(),
    };
    missionRepository.save.rejects('I should not be called');
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
    // eslint-disable-next-line mocha/no-setup-in-describe
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
      it(`should call save on appropriate repository for model ${modelName}`, async function () {
        // given
        const updatedRecord = Symbol('updated record');
        repositoriesByModel[modelName].save.withArgs(updatedRecord).resolves();

        // when
        await patchLearningContentCacheEntry({
          updatedRecord,
          modelName,
          ...repositories,
        });

        // then
        expect(repositoriesByModel[modelName].save).to.have.been.calledOnce;
        expect(repositoriesByModel[modelName].save).to.have.been.calledWithExactly(updatedRecord);
      });
    });
  });
});
