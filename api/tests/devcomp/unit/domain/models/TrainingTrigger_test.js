import { expect, domainBuilder, catchErr, sinon } from '../../../../test-helper.js';
import { TrainingTrigger } from '../../../../../src/devcomp/domain/models/TrainingTrigger.js';
import { KnowledgeElement } from '../../../../../lib/domain/models/KnowledgeElement.js';

describe('Unit | Domain | Models | TrainingTrigger', function () {
  describe('#constructor', function () {
    it('should be a valid type', function () {
      // given
      const trainingTrigger = domainBuilder.buildTrainingTrigger({ type: TrainingTrigger.types.PREREQUISITE });

      // then
      expect(trainingTrigger).to.be.instanceOf(TrainingTrigger);
    });

    it('should throw an error when type is not valid', async function () {
      // given
      const error = await catchErr(domainBuilder.buildTrainingTrigger)({ type: 'not_valid_type' });

      expect(error.message).to.equal('Invalid trigger type');
    });

    it('should have all properties', function () {
      // given
      const trainingTrigger = domainBuilder.buildTrainingTrigger({
        id: 1,
        type: TrainingTrigger.types.GOAL,
        trainingId: 100,
        threshold: 10,
      });

      // then
      expect(trainingTrigger.id).to.equal(1);
      expect(trainingTrigger.type).to.equal('goal');
      expect(trainingTrigger.trainingId).to.equal(100);
      expect(trainingTrigger.threshold).to.equal(10);
    });
  });

  describe('#isFulfilled', function () {
    describe('when trigger type is PREREQUISITE', function () {
      describe('when validated capped knowledge elements percentage is below threshold', function () {
        it('should return false', function () {
          // given
          const skills = Symbol('skills');
          const cappedSkills = [{ id: 'skill1' }, { id: 'skill2' }];
          const triggerTubes = [{ getCappedSkills: sinon.stub().withArgs(skills).returns(cappedSkills) }];
          const trainingTrigger = domainBuilder.buildTrainingTrigger({
            id: 1,
            type: TrainingTrigger.types.PREREQUISITE,
            trainingId: 100,
            threshold: 100,
            triggerTubes,
          });
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill1',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill1',
              status: KnowledgeElement.StatusType.INVALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill2',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill2',
              status: KnowledgeElement.StatusType.INVALIDATED,
            }),
          ];

          // when
          const isFulfilled = trainingTrigger.isFulfilled({
            knowledgeElements,
            skills,
          });

          // then
          expect(isFulfilled).to.be.false;
        });
      });

      describe('when validated capped knowledge elements percentage is above threshold', function () {
        it('should return true', function () {
          // given
          const skills = Symbol('skills');
          const cappedSkills = [{ id: 'skill1' }, { id: 'skill2' }];
          const triggerTubes = [{ getCappedSkills: sinon.stub().withArgs(skills).returns(cappedSkills) }];
          const trainingTrigger = domainBuilder.buildTrainingTrigger({
            id: 1,
            type: TrainingTrigger.types.PREREQUISITE,
            trainingId: 100,
            threshold: 90,
            triggerTubes,
          });
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill1',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill2',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
          ];

          // when
          const isFulfilled = trainingTrigger.isFulfilled({
            knowledgeElements,
            skills,
          });

          // then
          expect(isFulfilled).to.be.true;
        });
      });

      describe('when validated capped knowledge elements percentage is equal threshold', function () {
        it('should return true', function () {
          // given
          const skills = Symbol('skills');
          const cappedSkills = [{ id: 'skill1' }, { id: 'skill2' }];
          const triggerTubes = [{ getCappedSkills: sinon.stub().withArgs(skills).returns(cappedSkills) }];
          const trainingTrigger = domainBuilder.buildTrainingTrigger({
            id: 1,
            type: TrainingTrigger.types.PREREQUISITE,
            trainingId: 100,
            threshold: 100,
            triggerTubes,
          });
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill1',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill2',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
          ];

          // when
          const isFulfilled = trainingTrigger.isFulfilled({
            knowledgeElements,
            skills,
          });

          // then
          expect(isFulfilled).to.be.true;
        });
      });
    });

    describe('when trigger type is GOAL', function () {
      describe('when validated capped knowledge elements percentage is below threshold', function () {
        it('should return true', function () {
          // given
          const skills = Symbol('skills');
          const cappedSkills = [{ id: 'skill1' }, { id: 'skill2' }];
          const triggerTubes = [{ getCappedSkills: sinon.stub().withArgs(skills).returns(cappedSkills) }];
          const trainingTrigger = domainBuilder.buildTrainingTrigger({
            id: 1,
            type: TrainingTrigger.types.GOAL,
            trainingId: 100,
            threshold: 100,
            triggerTubes,
          });
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill1',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill1',
              status: KnowledgeElement.StatusType.INVALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill2',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill2',
              status: KnowledgeElement.StatusType.INVALIDATED,
            }),
          ];

          // when
          const isFulfilled = trainingTrigger.isFulfilled({
            knowledgeElements,
            skills,
          });

          // then
          expect(isFulfilled).to.be.true;
        });
      });

      describe('when validated capped knowledge elements percentage is above threshold', function () {
        it('should return true', function () {
          // given
          const skills = Symbol('skills');
          const cappedSkills = [{ id: 'skill1' }, { id: 'skill2' }];
          const triggerTubes = [{ getCappedSkills: sinon.stub().withArgs(skills).returns(cappedSkills) }];
          const trainingTrigger = domainBuilder.buildTrainingTrigger({
            id: 1,
            type: TrainingTrigger.types.GOAL,
            trainingId: 100,
            threshold: 90,
            triggerTubes,
          });
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill1',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill2',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
          ];

          // when
          const isFulfilled = trainingTrigger.isFulfilled({
            knowledgeElements,
            skills,
          });

          // then
          expect(isFulfilled).to.be.false;
        });
      });

      describe('when validated capped knowledge elements percentage is equal threshold', function () {
        it('should return true', function () {
          // given
          const skills = Symbol('skills');
          const cappedSkills = [{ id: 'skill1' }, { id: 'skill2' }];
          const triggerTubes = [{ getCappedSkills: sinon.stub().withArgs(skills).returns(cappedSkills) }];
          const trainingTrigger = domainBuilder.buildTrainingTrigger({
            id: 1,
            type: TrainingTrigger.types.GOAL,
            trainingId: 100,
            threshold: 100,
            triggerTubes,
          });
          const knowledgeElements = [
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill1',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
            domainBuilder.buildKnowledgeElement({
              skillId: 'skill2',
              status: KnowledgeElement.StatusType.VALIDATED,
            }),
          ];

          // when
          const isFulfilled = trainingTrigger.isFulfilled({
            knowledgeElements,
            skills,
          });

          // then
          expect(isFulfilled).to.be.true;
        });
      });
    });
  });
});
