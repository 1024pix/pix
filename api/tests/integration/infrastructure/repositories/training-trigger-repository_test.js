const { expect, databaseBuilder, domainBuilder, knex, mockLearningContent, sinon } = require('../../../test-helper');
const trainingTriggerRepository = require('../../../../lib/infrastructure/repositories/training-trigger-repository');
const { TrainingTrigger, TrainingTriggerTube } = require('../../../../lib/domain/models');
const _ = require('lodash');

describe('Integration | Repository | training-trigger-repository', function () {
  let tube;
  let tube1;

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
      competenceId: 'recCompetence0',
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
      competenceId: 'recCompetence0',
      thematicId: 'recThemA',
      skillIds: ['skillSuper', 'skillGenial'],
      skills: [],
    });
    const learningContent = {
      areas: [
        {
          id: 'recAreaA',
          title_i18n: {
            fr: 'titleFRA',
            en: 'titleENA',
          },
          color: 'colorA',
          code: 'codeA',
          frameworkId: 'fmk1',
          competenceIds: ['recCompA', 'recCompB'],
        },
      ],
      competences: [
        {
          id: 'recCompA',
          name_i18n: {
            fr: 'nameFRA',
            en: 'nameENA',
          },
          index: '1',
          areaId: 'recAreaA',
          origin: 'Pix',
          thematicIds: ['recThemA', 'recThemB'],
        },
      ],
      thematics: [
        {
          id: 'recThemA',
          name_i18n: {
            fr: 'nameFRA',
            en: 'nameENA',
          },
          index: '1',
          competenceId: 'recCompA',
          tubeIds: ['recTube1'],
        },
      ],
      tubes: [
        {
          id: 'recTube0',
          name: 'tubeName',
          title: 'tubeTitle',
          description: 'tubeDescription',
          practicalTitle_i18n: {
            fr: 'translatedPracticalTitle',
          },
          practicalDescription_i18n: {
            fr: 'translatedPracticalDescription',
          },
          isMobileCompliant: true,
          isTabletCompliant: true,
          competenceId: 'recCompetence0',
          thematicId: 'recThemA',
          skillIds: ['skillSuper', 'skillGenial'],
        },
        {
          id: 'recTube1',
          name: 'tubeName1',
          title: 'tubeTitle1',
          description: 'tubeDescription1',
          practicalTitle_i18n: {
            fr: 'translatedPracticalTitle',
          },
          practicalDescription_i18n: {
            fr: 'translatedPracticalDescription',
          },
          isMobileCompliant: true,
          isTabletCompliant: true,
          competenceId: 'recCompetence0',
          thematicId: 'recThemA',
          skillIds: ['skillSuper', 'skillGenial'],
        },
      ],
      skills: [
        {
          id: 'recSkillTube1',
          tubeId: 'recTube1',
          status: 'actif',
        },
      ],
    };
    mockLearningContent(learningContent);
  });

  describe('#createOrUpdate', function () {
    afterEach(async function () {
      await databaseBuilder.knex('training-trigger-tubes').delete();
      await databaseBuilder.knex('training-triggers').delete();
    });

    context('when trigger does not exist', function () {
      it('should create training trigger', async function () {
        // when
        const tubes = [
          { id: tube.id, level: 2 },
          { id: tube1.id, level: 4 },
        ];
        const type = TrainingTrigger.types.PREREQUISITE;
        const threshold = 20;
        const trainingId = databaseBuilder.factory.buildTraining().id;
        await databaseBuilder.commit();

        const createdTrainingTrigger = await trainingTriggerRepository.createOrUpdate({
          trainingId,
          triggerTubesForCreation: tubes,
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
          triggerTubesForCreation: tubes,
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
          triggerTubesForCreation: tubes,
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
      });
      const trainingTriggerTube2 = databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: trainingTrigger2.id,
        tubeId: tube1.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await trainingTriggerRepository.findByTrainingId({ trainingId });

      // then
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.be.instanceOf(TrainingTrigger);
      expect(result[0].id).to.equal(trainingTrigger.id);
      expect(result[0].type).to.equal(trainingTrigger.type);
      expect(result[0].threshold).to.equal(trainingTrigger.threshold);
      expect(result[0].triggerTubes).to.have.lengthOf(1);
      expect(result[0].triggerTubes[0]).to.be.instanceOf(TrainingTriggerTube);
      expect(result[0].triggerTubes[0].tube.id).to.equal(trainingTriggerTube.tubeId);
      expect(result[0].triggerTubes[0].tube.name).to.equal(tube.name);
      expect(result[0].triggerTubes[0].tube.practicalTitle).to.equal(tube.practicalTitle);
      expect(result[0].triggerTubes[0].level).to.equal(trainingTriggerTube.level);
      expect(result[0].areas).to.have.lengthOf(1);
      expect(result[0].areas[0].id).to.equal('recAreaA');
      expect(result[0].areas[0].competences).to.have.lengthOf(1);
      expect(result[0].areas[0].competences[0].id).to.equal('recCompA');
      expect(result[0].areas[0].competences[0].thematics).to.have.lengthOf(1);
      expect(result[0].areas[0].competences[0].thematics[0].id).to.equal('recThemA');

      expect(result[1]).to.be.instanceOf(TrainingTrigger);
      expect(result[1].id).to.equal(trainingTrigger2.id);
      expect(result[1].type).to.equal(trainingTrigger2.type);
      expect(result[1].threshold).to.equal(trainingTrigger2.threshold);
      expect(result[1].triggerTubes).to.have.lengthOf(1);
      expect(result[1].triggerTubes[0]).to.be.instanceOf(TrainingTriggerTube);
      expect(result[1].triggerTubes[0].tube.id).to.equal(trainingTriggerTube2.tubeId);
      expect(result[1].triggerTubes[0].tube.name).to.equal(tube1.name);
      expect(result[1].triggerTubes[0].tube.practicalTitle).to.equal(tube1.practicalTitle);
      expect(result[1].triggerTubes[0].level).to.equal(trainingTriggerTube2.level);
      expect(result[1].areas).to.have.lengthOf(1);
      expect(result[1].areas[0].id).to.equal('recAreaA');
      expect(result[1].areas[0].competences).to.have.lengthOf(1);
      expect(result[1].areas[0].competences[0].id).to.equal('recCompA');
      expect(result[1].areas[0].competences[0].thematics).to.have.lengthOf(1);
      expect(result[1].areas[0].competences[0].thematics[0].id).to.equal('recThemA');
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
