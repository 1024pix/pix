const { expect, databaseBuilder, domainBuilder, catchErr, mockLearningContent, knex } = require('../../../test-helper');
const { buildLearningContent } = require('../../../tooling/learning-content-builder');
const usecases = require('../../../../lib/domain/usecases');
const { InvalidStageError } = require('../../../../lib/domain/errors');
const Stage = require('../../../../lib/domain/models/Stage');

describe('Integration | UseCases | create-stage', function () {
  let targetProfileId;

  beforeEach(async function () {
    mockLearningContent(
      buildLearningContent([
        {
          id: 'fmk1',
          areas: [
            {
              id: 'area1',
              competences: [
                {
                  id: 'competence1',
                  thematics: [
                    {
                      id: 'thematic1',
                      name: 'Thematic 1',
                      tubes: [
                        {
                          id: 'tube1',
                          skills: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ])
    );

    targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('stages').delete();
  });

  it('should throw InvalidStageError if no level and threshold', async function () {
    // given
    const stage = domainBuilder.buildStage({
      targetProfileId,
      level: null,
      threshold: null,
    });

    // when
    const error = await catchErr(usecases.createStage)({ stage: stage });

    // then
    expect(error).to.be.an.instanceof(InvalidStageError);
  });

  it('should throw InvalidStageError if both level and threshold', async function () {
    // given
    const stage = domainBuilder.buildStage({
      targetProfileId,
      level: 5,
      threshold: 50,
    });

    // when
    const error = await catchErr(usecases.createStage)({ stage: stage });

    // then
    expect(error).to.be.an.instanceof(InvalidStageError);
  });

  describe('when target profile is tube based', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tube1', level: 4 });
      await databaseBuilder.commit();
    });

    describe('when target profile has no stages', function () {
      it('should throw InvalidStageError for an out of bound level', async function () {
        // given
        const stageWithLevel = domainBuilder.buildStage({
          targetProfileId,
          level: 5,
          threshold: null,
        });

        // when
        const error = await catchErr(usecases.createStage)({ stage: stageWithLevel });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
      });

      it('should create a stage by level', async function () {
        // given
        const stageWithLevel = domainBuilder.buildStage({
          targetProfileId,
          level: 2,
          threshold: null,
        });

        // when
        const stage = await usecases.createStage({ stage: stageWithLevel });

        // then
        expect(stage).to.be.an.instanceof(Stage);
      });

      it('should create a stage by threshold', async function () {
        // given
        const stageWithThreshold = domainBuilder.buildStage({
          targetProfileId,
          threshold: 50,
        });

        // when
        const stage = await usecases.createStage({ stage: stageWithThreshold });

        // then
        expect(stage).to.be.an.instanceof(Stage);
      });
    });

    describe('when target profile already has level stages', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildStage.withLevel({
          targetProfileId,
          level: 4,
        });
        await databaseBuilder.commit();
      });

      it('should create a stage by level', async function () {
        // given
        const stageWithLevel = domainBuilder.buildStage({
          targetProfileId,
          level: 2,
          threshold: null,
        });

        // when
        const stage = await usecases.createStage({ stage: stageWithLevel });

        // then
        expect(stage).to.be.an.instanceof(Stage);
      });

      it('should throw InvalidStageError for a threshold stage', async function () {
        // given
        const stageWithThreshold = domainBuilder.buildStage({
          targetProfileId,
          threshold: 30,
        });

        // when
        const error = await catchErr(usecases.createStage)({ stage: stageWithThreshold });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
      });

      it('should throw InvalidStageError for a stage with an already used level ', async function () {
        // given
        const stageWithLevel = domainBuilder.buildStage({
          targetProfileId,
          level: 4,
          threshold: null,
        });

        // when
        const error = await catchErr(usecases.createStage)({ stage: stageWithLevel });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
      });
    });

    describe('when target profile already has threshold stages', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildStage({
          threshold: 20,
          targetProfileId,
        });
        await databaseBuilder.commit();
      });

      it('should create a stage by threshold', async function () {
        // given
        const stageWithThreshold = domainBuilder.buildStage({
          targetProfileId,
          threshold: 50,
        });

        // when
        const stage = await usecases.createStage({ stage: stageWithThreshold });

        // then
        expect(stage).to.be.an.instanceof(Stage);
      });

      it('should throw exception if targetProfile contain stage with level', async function () {
        // given
        const stageWithLevel = domainBuilder.buildStage({
          targetProfileId,
          level: 3,
          threshold: null,
        });

        // when
        const error = await catchErr(usecases.createStage)({ stage: stageWithLevel });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
      });

      it('should throw exception if targetProfile contain stage with same value', async function () {
        // given
        const stageWithThreshold = domainBuilder.buildStage({
          targetProfileId,
          threshold: 20,
        });

        // when
        const error = await catchErr(usecases.createStage)({ stage: stageWithThreshold });

        // then
        expect(error).to.be.an.instanceof(InvalidStageError);
      });
    });
  });

  describe('when target profile is skill based', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId });
      await databaseBuilder.commit();
    });

    it('should throw an InvalidStageError', async function () {
      // given
      const stageWithLevel = domainBuilder.buildStage({
        targetProfileId,
        level: 6,
        threshold: null,
      });

      // when
      const error = await catchErr(usecases.createStage)({ stage: stageWithLevel });

      // then
      expect(error).to.be.an.instanceof(InvalidStageError);
    });
  });
});
