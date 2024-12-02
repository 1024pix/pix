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
    context('when entry is already in cache', function () {
      it('should patch learning content cache with provided updated entry', async function () {
        // given
        const recordId = 'recId';
        const updatedRecord = Symbol('updated record');
        const modelName = 'someModelName';
        const LearningContentCache = {
          instance: {
            get: sinon.stub(),
            patch: sinon.stub(),
          },
        };
        const learningContent = {
          someModelName: [
            { attr1: 'attr1 value index 0', id: 'otherRecordId' },
            { attr1: 'attr1 value index 1', id: recordId },
          ],
          someOtherModelName: [{ other: 'entry', id: recordId }],
        };
        LearningContentCache.instance.get.resolves(learningContent);

        // when
        await patchLearningContentCacheEntry({
          recordId,
          updatedRecord,
          modelName,
          LearningContentCache,
          ...repositories,
        });

        // then
        expect(LearningContentCache.instance.patch).to.have.been.calledWithExactly({
          operation: 'assign',
          path: 'someModelName[1]',
          value: updatedRecord,
        });
      });
    });
    context('when entry is not in cache', function () {
      it('should patch learning content cache by adding provided entry', async function () {
        // given
        const recordId = 'recId';
        const updatedRecord = Symbol('updated record');
        const modelName = 'someModelName';
        const LearningContentCache = {
          instance: {
            get: sinon.stub(),
            patch: sinon.stub(),
          },
        };
        const learningContent = {
          someModelName: [
            { attr1: 'attr1 value index 0', id: 'otherRecordId' },
            { attr1: 'attr1 value index 1', id: 'yetAnotherRecordId' },
          ],
          someOtherModelName: [{ other: 'entry', id: recordId }],
        };
        LearningContentCache.instance.get.resolves(learningContent);

        // when
        await patchLearningContentCacheEntry({
          recordId,
          updatedRecord,
          modelName,
          LearningContentCache,
          ...repositories,
        });

        // then
        expect(LearningContentCache.instance.patch).to.have.been.calledWithExactly({
          operation: 'push',
          path: 'someModelName',
          value: updatedRecord,
        });
      });
    });

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
        const recordId = 'recId';
        const updatedRecord = Symbol('updated record');
        const learningContent = {
          [modelName]: [
            { attr1: 'attr1 value index 0', id: 'otherRecordId' },
            { attr1: 'attr1 value index 1', id: recordId },
          ],
          someOtherModelName: [{ other: 'entry', id: recordId }],
        };
        const LearningContentCache = {
          instance: {
            get: sinon.stub().resolves(learningContent),
            patch: sinon.stub().resolves(),
          },
        };
        repositoriesByModel[modelName].save.withArgs(updatedRecord).resolves();

        // when
        await patchLearningContentCacheEntry({
          recordId,
          updatedRecord,
          modelName,
          LearningContentCache,
          ...repositories,
        });

        // then
        expect(repositoriesByModel[modelName].save).to.have.been.calledOnce;
        expect(repositoriesByModel[modelName].save).to.have.been.calledWithExactly(updatedRecord);
      });
    });
  });
});
