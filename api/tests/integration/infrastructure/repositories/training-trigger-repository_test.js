const {
  expect,
  databaseBuilder,
  domainBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
  sinon,
  catchErr,
} = require('../../../test-helper');
const trainingTriggerRepository = require('../../../../lib/infrastructure/repositories/training-trigger-repository');
const { TrainingTrigger, TrainingTriggerTube } = require('../../../../lib/domain/models');
const TrainingTriggerForAdmin = require('../../../../lib/domain/read-models/TrainingTriggerForAdmin');
const _ = require('lodash');
const { NotFoundError } = require('../../../../lib/domain/errors');
const logger = require('../../../../lib/infrastructure/logger');

describe('Integration | Repository | training-trigger-repository', function () {
  let learningContent;
  let tube;
  let tube1;
  let tube2;

  beforeEach(async function () {
    tube = domainBuilder.buildTube({
      id: 'recTube0',
      name: 'tubeName',
      title: 'tubeTitle',
      description: 'tubeDescription',
      practicalTitle: 'translatedPracticalTitle',
      practicalDescription: 'translatedPracticalDescription',
      isMobileCompliant: true,
      isTabletCompliant: true,
      competenceId: 'recCompA',
      thematicId: 'recThemA',
      skillIds: ['skillSuper', 'skillGenial'],
      skills: [],
    });
    tube1 = domainBuilder.buildTube({
      id: 'recTube1',
      name: 'tubeName1',
      title: 'tubeTitle1',
      description: 'tubeDescription1',
      practicalTitle: 'translatedPracticalTitle',
      practicalDescription: 'translatedPracticalDescription',
      isMobileCompliant: true,
      isTabletCompliant: true,
      competenceId: 'recCompA',
      thematicId: 'recThemA',
      skillIds: ['skillSuper', 'skillGenial'],
      skills: [],
    });
    tube2 = domainBuilder.buildTube({
      id: 'recTube2',
      name: 'tubeName2',
      title: 'tubeTitle2',
      description: 'tubeDescription2',
      practicalTitle: 'translatedPracticalTitle',
      practicalDescription: 'translatedPracticalDescription',
      isMobileCompliant: true,
      isTabletCompliant: true,
      competenceId: 'recCompA',
      thematicId: 'recThemA',
      skillIds: ['skillSuper', 'skillGenial'],
      skills: [],
    });

    learningContent = [
      {
        areas: [
          {
            id: 'recAreaA',
            title_i18n: { fr: 'domaine1_TitreFr' },
            color: 'someColor',
            competences: [
              {
                id: 'recCompA',
                name: 'Mener une recherche et une veille d’information',
                index: '1.1',
                thematics: [
                  {
                    id: 'recThemA',
                    name: 'thematic1_Name',
                    tubes: [tube, tube1, tube2],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
    mockLearningContent(learningContentObjects);
  });

  describe('#createOrUpdate', function () {
    afterEach(async function () {
      await databaseBuilder.knex('training-trigger-tubes').delete();
      await databaseBuilder.knex('training-triggers').delete();
    });

    context('when trigger does not exist', function () {
      it('should create training trigger', async function () {
        // when
        const triggerTubes = [
          { tubeId: tube.id, level: 2 },
          { tubeId: tube1.id, level: 4 },
        ];
        const type = TrainingTrigger.types.PREREQUISITE;
        const threshold = 20;
        const trainingId = databaseBuilder.factory.buildTraining().id;
        await databaseBuilder.commit();

        const createdTrainingTrigger = await trainingTriggerRepository.createOrUpdate({
          trainingId,
          triggerTubesForCreation: triggerTubes,
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
        expect(createdTrainingTrigger).to.be.instanceOf(TrainingTriggerForAdmin);
        expect(createdTrainingTrigger.id).to.equal(trainingTrigger.id);
        expect(createdTrainingTrigger.trainingId).to.equal(trainingTrigger.trainingId);
        expect(createdTrainingTrigger.type).to.equal(trainingTrigger.type);
        expect(createdTrainingTrigger.threshold).to.equal(trainingTrigger.threshold);
        expect(createdTrainingTrigger.areas).to.have.lengthOf(1);
        expect(createdTrainingTrigger.areas[0].id).to.equal('recAreaA');
        expect(createdTrainingTrigger.areas[0].competences).to.have.lengthOf(1);
        expect(createdTrainingTrigger.areas[0].competences[0].id).to.equal('recCompA');
        expect(createdTrainingTrigger.areas[0].competences[0].thematics).to.have.lengthOf(1);
        expect(createdTrainingTrigger.areas[0].competences[0].thematics[0].id).to.equal('recThemA');

        const trainingTriggerTubes = await knex('training-trigger-tubes')
          .where({
            trainingTriggerId: trainingTrigger.id,
          })
          .orderBy('tubeId', 'asc');

        const createdTrainingTriggerTubes = createdTrainingTrigger.areas[0].competences[0].thematics[0].triggerTubes;
        expect(createdTrainingTriggerTubes).to.have.lengthOf(2);
        expect(createdTrainingTriggerTubes[0]).to.be.instanceOf(TrainingTriggerTube);
        expect(createdTrainingTriggerTubes[0].id).to.deep.equal(trainingTriggerTubes[0].id);
        expect(createdTrainingTriggerTubes[0].tube.id).to.deep.equal(trainingTriggerTubes[0].tubeId);
        expect(createdTrainingTriggerTubes[0].tube.name).to.deep.equal(tube.name);
        expect(createdTrainingTriggerTubes[0].tube.title).to.deep.equal(tube.title);
        expect(createdTrainingTriggerTubes[0].level).to.deep.equal(trainingTriggerTubes[0].level);

        expect(createdTrainingTriggerTubes[1].id).to.deep.equal(trainingTriggerTubes[1].id);
        expect(createdTrainingTriggerTubes[1].tube.id).to.deep.equal(trainingTriggerTubes[1].tubeId);
        expect(createdTrainingTriggerTubes[1].tube.name).to.deep.equal(tube1.name);
        expect(createdTrainingTriggerTubes[1].tube.title).to.deep.equal(tube1.title);
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
        const triggerTubes = [
          { tubeId: 'recTube0', level: 2 },
          { tubeId: 'recTube1', level: 4 },
        ];

        const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({ updatedAt: new Date('2020-01-01') });
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: triggerTubes[0].tubeId,
          level: triggerTubes[0].level,
        });
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: triggerTubes[1].tubeId,
          level: triggerTubes[1].level,
        });
        await databaseBuilder.commit();

        const newTrainingTriggerTube = { tubeId: 'recTube2', level: 6 };

        triggerTubes[0].level = 4;
        triggerTubes.push(newTrainingTriggerTube);

        // when
        const updatedTrainingTrigger = await trainingTriggerRepository.createOrUpdate({
          threshold: 42,
          trainingId: trainingTrigger.trainingId,
          type: trainingTrigger.type,
          triggerTubesForCreation: triggerTubes,
        });

        // then
        const trainingTriggerTubes = await knex('training-trigger-tubes')
          .where({
            trainingTriggerId: trainingTrigger.id,
          })
          .orderBy('tubeId', 'asc');
        expect(trainingTriggerTubes).to.have.lengthOf(3);
        expect(updatedTrainingTrigger).to.be.instanceOf(TrainingTriggerForAdmin);
        expect(updatedTrainingTrigger.threshold).to.equal(42);

        expect(updatedTrainingTrigger.areas).to.have.lengthOf(1);
        expect(updatedTrainingTrigger.areas[0].competences).to.have.lengthOf(1);
        expect(updatedTrainingTrigger.areas[0].competences[0].thematics).to.have.lengthOf(1);

        const updatedTrainingTriggerTubes = _.sortBy(
          updatedTrainingTrigger.areas[0].competences[0].thematics[0].triggerTubes,
          'id'
        );
        expect(updatedTrainingTriggerTubes).to.have.lengthOf(trainingTriggerTubes.length);
        expect(updatedTrainingTriggerTubes[0].level).to.deep.equal(trainingTriggerTubes[0].level);

        const updatedTrainingTriggerDTO = await knex('training-triggers')
          .where({ id: updatedTrainingTrigger.id })
          .first('updatedAt');

        expect(updatedTrainingTriggerDTO.updatedAt).to.deep.equal(now);
      });

      it('should remove no longer needed tubes', async function () {
        // given
        const triggerTubes = [
          { tubeId: 'recTube0', level: 2 },
          { tubeId: 'recTube1', level: 4 },
        ];
        const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger();
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: triggerTubes[0].tubeId,
          level: triggerTubes[0].level,
        });
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: triggerTubes[1].tubeId,
          level: triggerTubes[1].level,
        });

        const anotherTrainingTriggerId = databaseBuilder.factory.buildTrainingTrigger().id;
        const anotherTrainingTriggerTube = databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: anotherTrainingTriggerId,
          tubeId: triggerTubes[0].tubeId,
          level: triggerTubes[0].level,
        });
        await databaseBuilder.commit();

        // when
        triggerTubes.pop();
        const updatedTrainingTrigger = await trainingTriggerRepository.createOrUpdate({
          trainingId: trainingTrigger.trainingId,
          triggerTubesForCreation: triggerTubes,
          type: trainingTrigger.type,
          threshold: trainingTrigger.threshold,
        });

        // then
        const trainingTriggerTubes = await knex('training-trigger-tubes').where({
          trainingTriggerId: trainingTrigger.id,
        });

        expect(trainingTriggerTubes).to.have.lengthOf(1);

        expect(updatedTrainingTrigger.areas).to.have.lengthOf(1);
        expect(updatedTrainingTrigger.areas[0].competences).to.have.lengthOf(1);
        expect(updatedTrainingTrigger.areas[0].competences[0].thematics).to.have.lengthOf(1);
        expect(updatedTrainingTrigger.areas[0].competences[0].thematics[0].triggerTubes).to.have.lengthOf(1);

        const othersTrainingTubes = await knex('training-trigger-tubes').where({ id: anotherTrainingTriggerTube.id });
        expect(othersTrainingTubes).to.have.lengthOf(1);
      });
    });
  });

  describe('#findByTrainingIdForAdmin', function () {
    it('should return the training trigger', async function () {
      // given
      const trainingId = databaseBuilder.factory.buildTraining().id;
      const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({ trainingId });
      const trainingTrigger2 = databaseBuilder.factory.buildTrainingTrigger({
        trainingId,
        type: TrainingTrigger.types.GOAL,
      });
      const trainingTriggerTube = databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: trainingTrigger.id,
        tubeId: tube.id,
      });
      const trainingTriggerTube2 = databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: trainingTrigger2.id,
        tubeId: tube1.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await trainingTriggerRepository.findByTrainingIdForAdmin({ trainingId });

      // then
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.be.instanceOf(TrainingTriggerForAdmin);
      expect(result[0].id).to.equal(trainingTrigger.id);
      expect(result[0].trainingId).to.equal(trainingTrigger.trainingId);
      expect(result[0].type).to.equal(trainingTrigger.type);
      expect(result[0].threshold).to.equal(trainingTrigger.threshold);
      expect(result[0].areas).to.have.lengthOf(1);
      expect(result[0].areas[0].id).to.equal('recAreaA');
      expect(result[0].areas[0].competences).to.have.lengthOf(1);
      expect(result[0].areas[0].competences[0].id).to.equal('recCompA');
      expect(result[0].areas[0].competences[0].thematics).to.have.lengthOf(1);
      expect(result[0].areas[0].competences[0].thematics[0].id).to.equal('recThemA');
      expect(result[0].areas[0].competences[0].thematics[0].triggerTubes).to.have.lengthOf(1);
      expect(result[0].areas[0].competences[0].thematics[0].triggerTubes[0]).to.be.instanceOf(TrainingTriggerTube);
      expect(result[0].areas[0].competences[0].thematics[0].triggerTubes[0].tube.id).to.equal(
        trainingTriggerTube.tubeId
      );
      expect(result[0].areas[0].competences[0].thematics[0].triggerTubes[0].tube.name).to.equal(tube.name);
      expect(result[0].areas[0].competences[0].thematics[0].triggerTubes[0].tube.practicalTitle).to.equal(
        tube.practicalTitle
      );
      expect(result[0].areas[0].competences[0].thematics[0].triggerTubes[0].level).to.equal(trainingTriggerTube.level);

      expect(result[1]).to.be.instanceOf(TrainingTriggerForAdmin);
      expect(result[1].id).to.equal(trainingTrigger2.id);
      expect(result[1].trainingId).to.equal(trainingTrigger2.trainingId);
      expect(result[1].type).to.equal(trainingTrigger2.type);
      expect(result[1].threshold).to.equal(trainingTrigger2.threshold);
      expect(result[1].areas).to.have.lengthOf(1);
      expect(result[1].areas[0].id).to.equal('recAreaA');
      expect(result[1].areas[0].competences).to.have.lengthOf(1);
      expect(result[1].areas[0].competences[0].id).to.equal('recCompA');
      expect(result[1].areas[0].competences[0].thematics).to.have.lengthOf(1);
      expect(result[1].areas[0].competences[0].thematics[0].id).to.equal('recThemA');
      expect(result[1].areas[0].competences[0].thematics[0].triggerTubes).to.have.lengthOf(1);
      expect(result[1].areas[0].competences[0].thematics[0].triggerTubes[0]).to.be.instanceOf(TrainingTriggerTube);
      expect(result[1].areas[0].competences[0].thematics[0].triggerTubes[0].tube.id).to.equal(
        trainingTriggerTube2.tubeId
      );
      expect(result[1].areas[0].competences[0].thematics[0].triggerTubes[0].tube.name).to.equal(tube1.name);
      expect(result[1].areas[0].competences[0].thematics[0].triggerTubes[0].tube.practicalTitle).to.equal(
        tube1.practicalTitle
      );
      expect(result[1].areas[0].competences[0].thematics[0].triggerTubes[0].level).to.equal(trainingTriggerTube2.level);
    });

    context('when tube is not found', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const trainingId = databaseBuilder.factory.buildTraining().id;
        const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({ trainingId });
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: 'notExistTubeId',
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(trainingTriggerRepository.findByTrainingIdForAdmin)({ trainingId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal(
          `Les sujets [notExistTubeId] du déclencheur ${trainingTrigger.id} n'existent pas dans le référentiel.`
        );
      });
    });

    it('should return empty array when no training trigger found', async function () {
      // given
      const trainingId = 123;

      // when
      const result = await trainingTriggerRepository.findByTrainingIdForAdmin({ trainingId });

      // then
      expect(result).to.be.empty;
    });
  });

  describe('#findByTrainingId', function () {
    it('should return the training trigger', async function () {
      // given
      const trainingId = databaseBuilder.factory.buildTraining().id;
      const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({ trainingId });
      const trainingTrigger2 = databaseBuilder.factory.buildTrainingTrigger({
        trainingId,
        type: TrainingTrigger.types.GOAL,
      });
      const trainingTriggerTube = databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: trainingTrigger.id,
        tubeId: tube.id,
        level: 3,
      });
      const trainingTriggerTube2 = databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: trainingTrigger2.id,
        tubeId: tube1.id,
        level: 4,
      });
      await databaseBuilder.commit();

      // when
      const result = await trainingTriggerRepository.findByTrainingId({ trainingId });

      // then
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.be.instanceOf(TrainingTrigger);
      expect(result[0].id).to.equal(trainingTrigger.id);
      expect(result[0].trainingId).to.equal(trainingTrigger.trainingId);
      expect(result[0].type).to.equal(trainingTrigger.type);
      expect(result[0].threshold).to.equal(trainingTrigger.threshold);

      expect(result[1]).to.be.instanceOf(TrainingTrigger);
      expect(result[1].id).to.equal(trainingTrigger2.id);
      expect(result[1].trainingId).to.equal(trainingTrigger2.trainingId);
      expect(result[1].type).to.equal(trainingTrigger2.type);
      expect(result[1].threshold).to.equal(trainingTrigger2.threshold);

      expect(result[0].triggerTubes).to.have.lengthOf(1);
      expect(result[0].triggerTubes[0]).to.be.instanceOf(TrainingTriggerTube);
      expect(result[0].triggerTubes[0].id).to.equal(trainingTriggerTube.id);
      expect(result[0].triggerTubes[0].level).to.equal(trainingTriggerTube.level);
      expect(result[0].triggerTubes[0].tube.id).to.equal(tube.id);

      expect(result[1].triggerTubes).to.have.lengthOf(1);
      expect(result[1].triggerTubes[0]).to.be.instanceOf(TrainingTriggerTube);
      expect(result[1].triggerTubes[0].id).to.equal(trainingTriggerTube2.id);
      expect(result[1].triggerTubes[0].level).to.equal(trainingTriggerTube2.level);
      expect(result[1].triggerTubes[0].tube.id).to.equal(tube1.id);
    });

    context('when tube is not found', function () {
      it('should log a warning', async function () {
        // given
        const trainingId = databaseBuilder.factory.buildTraining().id;
        const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({ trainingId });
        databaseBuilder.factory.buildTrainingTriggerTube({
          trainingTriggerId: trainingTrigger.id,
          tubeId: 'notExistTubeId',
        });
        await databaseBuilder.commit();

        sinon.stub(logger, 'warn').returns();

        // when
        await trainingTriggerRepository.findByTrainingId({ trainingId });

        // then
        expect(logger.warn).to.have.been.calledWithExactly({
          event: 'training_trigger_tubes_not_found',
          message: `Les sujets notExistTubeId du déclencheur ${trainingTrigger.id} n'existent pas dans le référentiel.`,
          notFoundTubeIds: ['notExistTubeId'],
          trainingTriggerId: trainingTrigger.id,
        });
      });
    });

    it('should return empty array when no training trigger found', async function () {
      // given
      const trainingId = 123;

      // when
      const result = await trainingTriggerRepository.findByTrainingId({ trainingId });

      // then
      expect(result).to.be.empty;
    });
  });
});
