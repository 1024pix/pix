import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';
import { Stage } from '../../../../../lib/domain/models/Stage.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { StageWithLinkedCampaignError } from '../../../../../src/evaluation/domain/errors.js';

function _buildLearningContent() {
  const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
  const learningContentObjects = learningContentBuilder([learningContent]);
  mockLearningContent(learningContentObjects);
}

describe('Integration | Domain | UseCases | update-stage', function () {
  context('when the stage exists', function () {
    context('when there is no linked campaign', function () {
      it('should return the updated domain object including level or threshold', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const stage = databaseBuilder.factory.buildStage({
          id: 100,
          targetProfileId,
          title: 'initial title',
          level: 1,
        });

        await databaseBuilder.commit();
        _buildLearningContent();

        const payload = {
          id: stage.id,
          targetProfileId,
          attributesToUpdate: {
            title: 'new title',
            level: 2,
          },
        };

        // when
        const updatedStage = await evaluationUsecases.updateStage({
          payloadStage: payload,
        });

        // then
        expect(updatedStage).to.be.instanceOf(Stage);
        expect(updatedStage.id).to.equal(payload.id);
        expect(updatedStage.title).to.equal(payload.attributesToUpdate.title);
        expect(updatedStage.level).to.equal(payload.attributesToUpdate.level);
      });
    });

    context('when a campaign is linked', function () {
      context('when it is a level stage', function () {
        context('when level stage is updated', function () {
          it('should throw an error', async function () {
            // given
            const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
            databaseBuilder.factory.buildCampaign({
              targetProfileId,
            });
            const stage = databaseBuilder.factory.buildStage({
              id: 100,
              targetProfileId,
              title: 'initial title',
              level: 1,
              threshold: null,
            });

            await databaseBuilder.commit();

            _buildLearningContent();

            const payload = {
              id: stage.id,
              targetProfileId: stage.targetProfileId,
              attributesToUpdate: {
                level: 2,
              },
            };

            // when
            const error = await catchErr(evaluationUsecases.updateStage)({
              payloadStage: payload,
            });

            // then
            expect(error).to.be.instanceof(StageWithLinkedCampaignError);
            expect(error.message).to.equal('The stage is part of a target profile linked to a campaign');
          });
        });
        context('when level stage is the same', function () {
          it('should update the stage', async function () {
            // given
            const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
            databaseBuilder.factory.buildCampaign({
              targetProfileId,
            });
            const stage = databaseBuilder.factory.buildStage({
              id: 100,
              targetProfileId,
              title: 'initial title',
              level: 1,
              threshold: null,
            });

            await databaseBuilder.commit();
            _buildLearningContent();

            const payload = {
              id: stage.id,
              targetProfileId,
              attributesToUpdate: {
                title: 'new title',
                message: 'new message',
                prescriberTitle: 'new prescriber title',
                prescriberDescription: 'new prescriber description',
                level: 1,
              },
            };

            // when
            const updatedStage = await evaluationUsecases.updateStage({
              payloadStage: payload,
            });

            // then
            expect(updatedStage).to.be.instanceOf(Stage);
            expect(updatedStage.id).to.equal(payload.id);
            expect(updatedStage.level).to.equal(1);
            expect(updatedStage.title).to.equal(payload.attributesToUpdate.title);
            expect(updatedStage.message).to.equal(payload.attributesToUpdate.message);
            expect(updatedStage.prescriberTitle).to.equal(payload.attributesToUpdate.prescriberTitle);
            expect(updatedStage.prescriberDescription).to.equal(payload.attributesToUpdate.prescriberDescription);
          });
        });
      });

      context('when it is a threshold stage', function () {
        context('when threshold is updated', function () {
          it('should throw an error', async function () {
            // given
            const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
            databaseBuilder.factory.buildCampaign({
              targetProfileId,
            });
            const stage = databaseBuilder.factory.buildStage({
              id: 100,
              targetProfileId,
              title: 'initial title',
              threshold: 10,
            });

            await databaseBuilder.commit();

            _buildLearningContent();

            const payload = {
              id: stage.id,
              targetProfileId: stage.targetProfileId,
              attributesToUpdate: {
                threshold: 20,
              },
            };

            // when
            const error = await catchErr(evaluationUsecases.updateStage)({
              payloadStage: payload,
            });

            // then
            expect(error).to.be.instanceof(StageWithLinkedCampaignError);
            expect(error.message).to.equal('The stage is part of a target profile linked to a campaign');
          });
        });
        context('when threshold is the same', function () {
          it('should update the stage', async function () {
            // given
            const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
            databaseBuilder.factory.buildCampaign({
              targetProfileId,
            });
            const stage = databaseBuilder.factory.buildStage({
              id: 100,
              targetProfileId,
              title: 'initial title',
              threshold: 10,
            });

            await databaseBuilder.commit();
            _buildLearningContent();

            const payload = {
              id: stage.id,
              targetProfileId,
              attributesToUpdate: {
                title: 'new title',
                message: 'new message',
                prescriberTitle: 'new prescriber title',
                prescriberDescription: 'new prescriber description',
                threshold: 10,
              },
            };

            // when
            const updatedStage = await evaluationUsecases.updateStage({
              payloadStage: payload,
            });

            // then
            expect(updatedStage).to.be.instanceOf(Stage);
            expect(updatedStage.id).to.equal(payload.id);
            expect(updatedStage.threshold).to.equal(10);
            expect(updatedStage.title).to.equal(payload.attributesToUpdate.title);
            expect(updatedStage.message).to.equal(payload.attributesToUpdate.message);
            expect(updatedStage.prescriberTitle).to.equal(payload.attributesToUpdate.prescriberTitle);
            expect(updatedStage.prescriberDescription).to.equal(payload.attributesToUpdate.prescriberDescription);
          });
        });
      });
    });
  });
});
