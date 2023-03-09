const { expect } = require('../../../../test-helper');

const StageCollection = require('../../../../../lib/domain/models/user-campaign-results/StageCollection');

describe('Unit | Domain | Models | StageCollection', function () {
  context('getReachedStage', function () {
    context('When stage collection has no first skill stage', function () {
      let stageCollection;
      beforeEach(function () {
        const campaignId = 18;
        const stages = [
          {
            id: 0,
            threshold: 0,
            title: 'Palier 0',
            message: 'Message palier 0',
            precriberDescription: 'yolo',
            prescriberTitle: 'coucou',
          },
          {
            id: 1,
            threshold: 50,
            title: 'Palier 1',
            message: 'Message palier 1',
            precriberDescription: 'yolo',
            prescriberTitle: 'coucou',
          },
          {
            id: 2,
            threshold: 80,
            title: 'Palier 2',
            message: 'Message palier 2',
            precriberDescription: 'yolo',
            prescriberTitle: 'coucou',
          },
        ];

        stageCollection = new StageCollection({ id: campaignId, stages });
      });

      it('should return reached first stage', function () {
        //given
        const masteryPercentage = 0;
        const validatedSkillCount = 0;
        // when
        const reachedStage = stageCollection.getReachedStage(validatedSkillCount, masteryPercentage);
        //then
        expect(reachedStage).to.deep.equal({
          id: 0,
          title: 'Palier 0',
          message: 'Message palier 0',
          precriberDescription: 'yolo',
          prescriberTitle: 'coucou',
          totalStage: 3,
          reachedStage: 1,
        });
      });

      it('should return reached second stage', function () {
        //given
        const masteryPercentage = 50;
        const validatedSkillCount = 9;
        // when
        const reachedStage = stageCollection.getReachedStage(validatedSkillCount, masteryPercentage);
        //then
        expect(reachedStage).to.deep.equal({
          id: 1,
          title: 'Palier 1',
          message: 'Message palier 1',
          precriberDescription: 'yolo',
          prescriberTitle: 'coucou',
          totalStage: 3,
          reachedStage: 2,
        });
      });

      it('should return reached third stage', function () {
        //given
        const masteryPercentage = 95;
        const validatedSkillCount = 28;
        // when
        const reachedStage = stageCollection.getReachedStage(validatedSkillCount, masteryPercentage);
        //then
        expect(reachedStage).to.deep.equal({
          id: 2,
          title: 'Palier 2',
          message: 'Message palier 2',
          precriberDescription: 'yolo',
          prescriberTitle: 'coucou',
          totalStage: 3,
          reachedStage: 3,
        });
      });
    });

    context('When stage collection has first skill stage', function () {
      let stageCollection;
      beforeEach(function () {
        const campaignId = 18;
        const stages = [
          {
            id: 0,
            threshold: 0,
            isFirstSkill: false,
            title: 'Palier 0',
            message: 'Message palier 0',
            precriberDescription: 'yolo',
            prescriberTitle: 'coucou',
          },
          {
            id: 2,
            threshold: 50,
            isFirstSkill: false,
            title: 'Palier 1',
            message: 'Message palier 1',
            precriberDescription: 'yolo',
            prescriberTitle: 'coucou',
          },
          {
            id: 3,
            threshold: 80,
            isFirstSkill: false,
            title: 'Palier 2',
            message: 'Message palier 2',
            precriberDescription: 'yolo',
            prescriberTitle: 'coucou',
          },
          {
            id: 1,
            threshold: null,
            isFirstSkill: true,
            title: 'Palier 1er Acquis',
            message: 'Message palier 1er Acquis',
            precriberDescription: 'yolo',
            prescriberTitle: 'coucou',
          },
        ];

        stageCollection = new StageCollection({ id: campaignId, stages });
      });

      it('should return reached first stage', function () {
        //given
        const masteryPercentage = 0;
        const validatedSkillCount = 0;
        // when
        const reachedStage = stageCollection.getReachedStage(validatedSkillCount, masteryPercentage);
        //then
        expect(reachedStage).to.deep.equal({
          id: 0,
          title: 'Palier 0',
          message: 'Message palier 0',
          precriberDescription: 'yolo',
          prescriberTitle: 'coucou',
          totalStage: 4,
          reachedStage: 1,
        });
      });

      it('should return reached first skill stage (which is second stage)', function () {
        //given
        const masteryPercentage = 25;
        const validatedSkillCount = 2;
        // when
        const reachedStage = stageCollection.getReachedStage(validatedSkillCount, masteryPercentage);
        //then
        expect(reachedStage).to.deep.equal({
          id: 1,
          title: 'Palier 1er Acquis',
          message: 'Message palier 1er Acquis',
          precriberDescription: 'yolo',
          prescriberTitle: 'coucou',
          totalStage: 4,
          reachedStage: 2,
        });
      });

      it('should return reached third stage', function () {
        //given
        const masteryPercentage = 50;
        const validatedSkillCount = 9;
        // when
        const reachedStage = stageCollection.getReachedStage(validatedSkillCount, masteryPercentage);
        //then
        expect(reachedStage).to.deep.equal({
          id: 2,
          title: 'Palier 1',
          message: 'Message palier 1',
          precriberDescription: 'yolo',
          prescriberTitle: 'coucou',
          totalStage: 4,
          reachedStage: 3,
        });
      });

      it('should return reached fourth stage', function () {
        //given
        const masteryPercentage = 95;
        const validatedSkillCount = 28;
        // when
        const reachedStage = stageCollection.getReachedStage(validatedSkillCount, masteryPercentage);
        //then
        expect(reachedStage).to.deep.equal({
          id: 3,
          title: 'Palier 2',
          message: 'Message palier 2',
          precriberDescription: 'yolo',
          prescriberTitle: 'coucou',
          totalStage: 4,
          reachedStage: 4,
        });
      });
    });
  });
});
