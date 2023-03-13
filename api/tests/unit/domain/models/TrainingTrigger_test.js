const { expect, domainBuilder, catchErr } = require('../../../test-helper');
const TrainingTrigger = require('../../../../lib/domain/models/TrainingTrigger');

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
        areas: [],
      });

      // then
      expect(trainingTrigger.id).to.equal(1);
      expect(trainingTrigger.type).to.equal('goal');
      expect(trainingTrigger.trainingId).to.equal(100);
      expect(trainingTrigger.threshold).to.equal(10);
      expect(trainingTrigger.areas).to.deep.equal([]);
    });

    it('should build learning content tree from parameters', function () {
      // given
      const area1 = domainBuilder.buildArea({ id: 'recArea1' });
      const competence1 = domainBuilder.buildCompetence({ id: 'recCompetence1', areaId: 'recArea1' });
      const competence2InAnotherArea = domainBuilder.buildCompetence({ id: 'recCompetence2', areaId: 'recArea2' });
      const thematic1 = domainBuilder.buildThematic({ id: 'recThematic1', competenceId: 'recCompetence1' });
      const thematic2 = domainBuilder.buildThematic({ id: 'recThematic2', competenceId: 'recCompetence1' });
      const thematic3InAnotherCompetence = domainBuilder.buildThematic({
        id: 'recThematic3',
        competenceId: 'recCompetence2',
      });
      const tube1 = domainBuilder.buildTube({
        id: 'recTube1',
        thematicId: thematic1.id,
      });
      const tube2 = domainBuilder.buildTube({
        id: 'recTube2',
        thematicId: thematic2.id,
      });
      const tube3InAnotherThematic = domainBuilder.buildTube({
        id: 'recTube3',
        thematicId: thematic3InAnotherCompetence.id,
      });
      const trainingTriggerTube1 = domainBuilder.buildTrainingTriggerTube({
        id: 'recTrainingTriggerTube1',
        tube: tube1,
      });
      const trainingTriggerTube2 = domainBuilder.buildTrainingTriggerTube({
        id: 'recTrainingTriggerTube2',
        tube: tube2,
      });
      const trainingTriggerTube3 = domainBuilder.buildTrainingTriggerTube({
        id: 'recTrainingTriggerTube3',
        tube: tube3InAnotherThematic,
      });

      const trainingTrigger = domainBuilder.buildTrainingTrigger({
        type: TrainingTrigger.types.PREREQUISITE,
        areas: [area1],
        competences: [competence1, competence2InAnotherArea],
        thematics: [thematic1, thematic2, thematic3InAnotherCompetence],
        triggerTubes: [trainingTriggerTube1, trainingTriggerTube2, trainingTriggerTube3],
      });

      // then
      expect(trainingTrigger.areas).to.have.length(1);
      expect(trainingTrigger.areas[0]).to.have.property('id', area1.id);
      expect(trainingTrigger.areas[0]).to.have.property('title', area1.title);
      expect(trainingTrigger.areas[0]).to.have.property('code', area1.code);
      expect(trainingTrigger.areas[0]).to.have.property('color', area1.color);
      expect(trainingTrigger.areas[0].competences).to.have.length(1);
      expect(trainingTrigger.areas[0].competences[0]).to.have.property('id', competence1.id);
      expect(trainingTrigger.areas[0].competences[0]).to.have.property('name', competence1.name);
      expect(trainingTrigger.areas[0].competences[0]).to.have.property('index', competence1.index);
      expect(trainingTrigger.areas[0].competences[0].thematics).to.have.length(2);
      expect(trainingTrigger.areas[0].competences[0].thematics[0]).to.have.property('id', thematic1.id);
      expect(trainingTrigger.areas[0].competences[0].thematics[0]).to.have.property('name', thematic1.name);
      expect(trainingTrigger.areas[0].competences[0].thematics[0]).to.have.property('index', thematic1.index);
      expect(trainingTrigger.areas[0].competences[0].thematics[0].triggerTubes).to.have.length(1);
      expect(trainingTrigger.areas[0].competences[0].thematics[0].triggerTubes[0]).to.equal(trainingTriggerTube1.id);
      expect(trainingTrigger.areas[0].competences[0].thematics[1]).to.have.property('id', thematic2.id);
      expect(trainingTrigger.areas[0].competences[0].thematics[1]).to.have.property('name', thematic2.name);
      expect(trainingTrigger.areas[0].competences[0].thematics[1]).to.have.property('index', thematic2.index);
      expect(trainingTrigger.areas[0].competences[0].thematics[1].triggerTubes).to.have.length(1);
      expect(trainingTrigger.areas[0].competences[0].thematics[1].triggerTubes[0]).to.equal(trainingTriggerTube2.id);
    });
  });
});
