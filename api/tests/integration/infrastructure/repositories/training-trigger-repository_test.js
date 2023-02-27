const { expect, databaseBuilder, knex, sinon } = require('../../../test-helper');
const trainingTriggerRepository = require('../../../../lib/infrastructure/repositories/training-trigger-repository');
const TrainingTrigger = require('../../../../lib/domain/models/TrainingTrigger');
const TrainingTriggerTube = require('../../../../lib/domain/models/TrainingTriggerTube');
const _ = require('lodash');

describe('Integration | Repository | training-trigger-repository', function () {
  describe('#createOrUpdate', function () {
    afterEach(async function () {
      await databaseBuilder.knex('training-trigger-tubes').delete();
      await databaseBuilder.knex('training-triggers').delete();
    });

    context('when trigger does not exist', function () {
      it('should create training trigger', async function () {
        // when
        const tubes = [
          { id: 'tubeId1', level: 2 },
          { id: 'tubeId2', level: 4 },
        ];
        const type = TrainingTrigger.types.PREREQUISITE;
        const threshold = 20;
        const trainingId = databaseBuilder.factory.buildTraining().id;
        await databaseBuilder.commit();

        const createdTrainingTrigger = await trainingTriggerRepository.createOrUpdate({
          trainingId,
          tubes,
          type,
          threshold,
        });

        // then
        const trainingTrigger = await knex('training-triggers')
          .where({
            trainingId,
            type,
          })
          .first();
        expect(createdTrainingTrigger).to.be.instanceOf(TrainingTrigger);
        expect(createdTrainingTrigger.id).to.equal(trainingTrigger.id);
        expect(createdTrainingTrigger.trainingId).to.equal(trainingTrigger.trainingId);
        expect(createdTrainingTrigger.type).to.equal(trainingTrigger.type);
        expect(createdTrainingTrigger.threshold).to.equal(trainingTrigger.threshold);

        const trainingTriggerTubes = await knex('training-trigger-tubes')
          .where({
            trainingTriggerId: trainingTrigger.id,
          })
          .orderBy('tubeId', 'asc');

        const createdTrainingTriggerTubes = _.sortBy(createdTrainingTrigger.triggerTubes, 'id');
        expect(createdTrainingTriggerTubes[0]).to.be.instanceOf(TrainingTriggerTube);
        expect(createdTrainingTriggerTubes[0].id).to.deep.equal(trainingTriggerTubes[0].id);
        expect(createdTrainingTriggerTubes[0].tube.id).to.deep.equal(trainingTriggerTubes[0].tubeId);
        expect(createdTrainingTriggerTubes[0].level).to.deep.equal(trainingTriggerTubes[0].level);
        expect(createdTrainingTriggerTubes[1].id).to.deep.equal(trainingTriggerTubes[1].id);
        expect(createdTrainingTriggerTubes[1].tube.id).to.deep.equal(trainingTriggerTubes[1].tubeId);
        expect(createdTrainingTriggerTubes[1].level).to.deep.equal(trainingTriggerTubes[1].level);
      });
    });

    context('when trigger already exists', function () {
      let clock;
      let now;

      beforeEach(function () {
        now = new Date('2022-02-02');
        clock = sinon.useFakeTimers(now);
      });

      afterEach(function () {
        clock.restore();
      });

      it('should update it', async function () {
        // given
        const tubes = [
          { id: 'tubeId1', level: 2 },
          { id: 'tubeId2', level: 4 },
        ];

        const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({ updatedAt: new Date('2020-01-01') });
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: tubes[0].id,
          level: tubes[0].level,
        });
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: tubes[1].id,
          level: tubes[1].level,
        });
        await databaseBuilder.commit();

        tubes[0].level = 4;
        tubes.push({ id: 'tubeId3', level: 6 });

        // when
        const updatedTrainingTrigger = await trainingTriggerRepository.createOrUpdate({
          threshold: 42,
          trainingId: trainingTrigger.trainingId,
          type: trainingTrigger.type,
          tubes,
        });

        // then
        const trainingTriggerTubes = await knex('training-trigger-tubes')
          .where({
            trainingTriggerId: trainingTrigger.id,
          })
          .orderBy('tubeId', 'asc');
        expect(trainingTriggerTubes).to.have.lengthOf(3);
        expect(updatedTrainingTrigger).to.be.instanceOf(TrainingTrigger);
        expect(updatedTrainingTrigger.threshold).to.equal(42);

        const updatedTrainingTriggerTubes = _.sortBy(updatedTrainingTrigger.triggerTubes, 'id');
        expect(updatedTrainingTriggerTubes[0].level).to.deep.equal(trainingTriggerTubes[0].level);
        expect(updatedTrainingTriggerTubes).to.be.lengthOf(trainingTriggerTubes.length);

        const updatedTrainingTriggerDTO = await knex('training-triggers')
          .where({ id: updatedTrainingTrigger.id })
          .first('updatedAt');

        expect(updatedTrainingTriggerDTO.updatedAt).to.deep.equal(now);
      });

      it('should remove no longer needed tubes', async function () {
        // given
        const tubes = [
          { id: 'tubeId1', level: 2 },
          { id: 'tubeId2', level: 4 },
        ];
        const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger();
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: tubes[0].id,
          level: tubes[0].level,
        });
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: tubes[1].id,
          level: tubes[1].level,
        });

        const anotherTrainingTriggerId = databaseBuilder.factory.buildTrainingTrigger().id;
        const anotherTrainingTriggerTube = databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: anotherTrainingTriggerId,
          tubeId: tubes[0].id,
          level: tubes[0].level,
        });
        await databaseBuilder.commit();

        // when
        tubes.pop();
        const updatedTrainingTrigger = await trainingTriggerRepository.createOrUpdate({
          trainingId: trainingTrigger.trainingId,
          tubes,
          type: trainingTrigger.type,
          threshold: trainingTrigger.threshold,
        });

        // then
        const trainingTriggerTubes = await knex('training-trigger-tubes').where({
          trainingTriggerId: trainingTrigger.id,
        });

        expect(trainingTriggerTubes).to.have.lengthOf(1);
        expect(updatedTrainingTrigger.triggerTubes).to.have.lengthOf(1);

        const othersTrainingTubes = await knex('training-trigger-tubes').where({ id: anotherTrainingTriggerTube.id });
        expect(othersTrainingTubes).to.have.lengthOf(1);
      });
    });
  });
});
