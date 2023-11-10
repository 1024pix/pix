import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { compare } from '../../../../../lib/domain/services/stages/stage-and-stage-acquisition-comparison-service.js';
import { Stage } from '../../../../../src/evaluation/domain/models/Stage.js';

describe('Unit | Service | Stages acquisition', function () {
  context('Stages are defined by thresholds', function () {
    let availableStages;
    let stagesAcquisitions;
    let stagesFormatService;

    before(function () {
      availableStages = [
        { id: 50, threshold: 30 },
        { id: 10, threshold: null, level: null, isFirstSkill: true },
        { id: 40, threshold: 0 },
        { id: 1, threshold: 10 },
        { id: 2, threshold: 20 },
        { id: 4, threshold: 40 },
        { id: 6, threshold: 60 },
        { id: 5, threshold: 50 },
      ].map(domainBuilder.buildStage);

      stagesAcquisitions = [
        { id: 3, stageId: 50 },
        { id: 2, stageId: 2 },
        { id: 1, stageId: 1 },
        { id: 4, stageId: 10 },
        { id: 5, stageId: 40 },
      ].map(domainBuilder.buildStageAcquisition);

      stagesFormatService = compare(availableStages, stagesAcquisitions);
    });

    describe('totalNumberOfStages', function () {
      it('should return the correct number of stages', function () {
        expect(stagesFormatService.totalNumberOfStages).to.deep.equal(availableStages.length);
      });
    });
    describe('reachedStageNumber', function () {
      it('should return the correct number of stages', function () {
        expect(stagesFormatService.reachedStageNumber).to.deep.equal(5);
      });
    });
    describe('reachedStage', function () {
      it('should return the correct number of stages', function () {
        expect(stagesFormatService.reachedStage).to.be.an.instanceOf(Stage);
        expect(stagesFormatService.reachedStage.id).to.deep.equal(50);
      });
    });
  });
  context('Stages are defined by levels', function () {
    let availableStages;
    let stagesAcquisitions;
    let stagesFormatService;

    before(function () {
      availableStages = [
        { id: 4, level: 2 },
        { id: 1, level: 5 },
        { id: 6, level: 3 },
        { id: 5, level: 8 },
        { id: 2, level: 1 },
        { id: 50, level: 0 },
      ].map(domainBuilder.buildStage);

      stagesAcquisitions = [
        { id: 3, stageId: 4 },
        { id: 1, stageId: 50 },
      ].map(domainBuilder.buildStageAcquisition);

      stagesFormatService = compare(availableStages, stagesAcquisitions);
    });

    describe('totalNumberOfStages', function () {
      it('should return the correct number of stages', function () {
        expect(stagesFormatService.totalNumberOfStages).to.deep.equal(availableStages.length);
      });
    });
    describe('reachedStageNumber', function () {
      it('should return the correct number of stages', function () {
        expect(stagesFormatService.reachedStageNumber).to.deep.equal(2);
      });
    });
    describe('reachedStage', function () {
      it('should return the correct number of stages', function () {
        expect(stagesFormatService.reachedStage).to.be.an.instanceOf(Stage);
        expect(stagesFormatService.reachedStage.id).to.deep.equal(4);
      });
    });
  });
});
