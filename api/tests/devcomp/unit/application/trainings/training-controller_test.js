import sinon from 'sinon';

import { trainingController } from '../../../../../src/devcomp/application/trainings/training-controller.js';
import { TrainingTrigger } from '../../../../../src/devcomp/domain/models/TrainingTrigger.js';
import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Devcomp | Application | Trainings | Controller | training-controller', function () {
  describe('#findPaginatedTrainingSummaries', function () {
    it('should call the training findPaginatedTrainingSummaries use-case', async function () {
      // given
      const trainingSummaries = [{ id: 1 }];
      const meta = { page: 1 };
      const useCaseParameters = {
        filter: { id: 1 },
        page: { size: 2, number: 1 },
      };

      sinon.stub(usecases, 'findPaginatedTrainingSummaries').resolves({ trainings: trainingSummaries, meta });

      // when
      const response = await trainingController.findPaginatedTrainingSummaries(
        {
          query: {
            filter: { id: 1 },
            page: { size: 2, number: 1 },
          },
        },
        hFake,
      );

      // then
      expect(usecases.findPaginatedTrainingSummaries).to.have.been.calledWithExactly(useCaseParameters);
      expect(response).to.deep.equal({
        data: [{ id: '1', type: 'training-summaries' }],
        meta: { page: 1 },
      });
    });
  });

  describe('#getById', function () {
    it('should get training by id', async function () {
      // given
      const trainingId = 1;
      sinon.stub(usecases, 'getTraining').resolves({ id: trainingId, duration: {} });

      // when
      const response = await trainingController.getById({ params: { trainingId } }, hFake);

      // then
      expect(usecases.getTraining).to.have.been.calledWithExactly({ trainingId });
      expect(response.data.id).to.equal('1');
      expect(response.data.type).to.equal('trainings');
    });
  });

  describe('#create', function () {
    it('should call the training create use-case', async function () {
      // given
      const createdTraining = {
        title: 'A new training',
        internalTitle: 'A new internal training title',
        locales: ['fr'],
        duration: {
          days: 2,
          hours: 2,
          minutes: 2,
        },
      };
      sinon.stub(usecases, 'createTraining').resolves(createdTraining);
      const payload = { data: { attributes: createdTraining } };

      // when
      const result = await trainingController.create({ payload }, hFake);

      // then
      expect(usecases.createTraining).to.have.been.calledOnceWithExactly({
        training: {
          title: 'A new training',
          internalTitle: 'A new internal training title',
          locales: ['fr'],
          duration: '2d2h2m',
        },
      });
      expect(result.source.data.type).to.equal('trainings');
      expect(result.source.data.attributes.title).to.equal(createdTraining.title);
    });
  });

  describe('#duplicate', function () {
    it('should call the duplicateTraining use-case', async function () {
      // given
      const createdTraining = {
        id: 124,
        title: 'Training title',
        internalTitle: '[Copie] Training internal title',
        duration: {
          days: 2,
          hours: 2,
          minutes: 2,
        },
      };
      sinon.stub(usecases, 'duplicateTraining').resolves(createdTraining);
      const trainingId = 123;
      const request = { params: { trainingId } };

      // when
      const response = await trainingController.duplicate(request, hFake);

      // then
      expect(usecases.duplicateTraining).to.have.been.calledOnceWithExactly({ trainingId });
      expect(response.source).to.deep.equal({ trainingId: createdTraining.id });
    });
  });

  describe('#update', function () {
    describe('when request is valid', function () {
      it('should call the training update use-case', async function () {
        // given
        const trainingId = 123;
        const training = { title: 'new title', link: 'https://example.net/new-link' };
        sinon.stub(usecases, 'updateTraining').resolves({ id: trainingId, ...training, duration: {} });
        const payload = { data: { attributes: training } };

        // when
        const result = await trainingController.update({ params: { trainingId }, payload }, hFake);

        // then
        expect(usecases.updateTraining).to.have.been.calledWithExactly({
          training: { id: trainingId, ...training },
        });
        expect(result.data.id).to.equal(String(trainingId));
        expect(result.data.type).to.equal('trainings');
        expect(result.data.attributes.title).to.equal(training.title);
      });
    });
  });

  describe('#createOrUpdateTrigger', function () {
    it('should call the createOrUpdateTrigger use-case', async function () {
      // given
      const payload = {
        data: {
          attributes: {
            type: TrainingTrigger.types.PREREQUISITE,
            threshold: 45,
            tubes: [{ id: 'recTube123', level: 2 }],
          },
        },
      };

      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

      sinon.stub(usecases, 'createOrUpdateTrainingTrigger').resolves({
        id: 145,
        type: TrainingTrigger.types.PREREQUISITE,
        threshold: 45,
        tubes: [{ id: 'recTube123', level: 2 }],
      });

      // when
      const result = await trainingController.createOrUpdateTrigger({ params: { trainingId: 145 }, payload }, hFake);

      // then
      expect(usecases.createOrUpdateTrainingTrigger).to.have.been.calledWithExactly({
        trainingId: 145,
        threshold: 45,
        type: TrainingTrigger.types.PREREQUISITE,
        tubes: [{ id: 'recTube123', level: 2 }],
      });
      expect(result.data.id).to.equal('145');
      expect(result.data.type).to.equal('training-triggers');
    });
  });

  describe('#findTargetProfileSummaries', function () {
    it('should call the findTargetProfileSummaries use-case', async function () {
      // given
      const trainingId = 145;
      sinon.stub(usecases, 'findTargetProfileSummariesForTraining').resolves([{ id: 1 }]);

      // when
      const result = await trainingController.findTargetProfileSummaries({ params: { trainingId } }, hFake);

      // then
      expect(usecases.findTargetProfileSummariesForTraining).to.have.been.calledWithExactly({ trainingId });
      expect(result.data).to.deep.equal([{ id: '1', type: 'target-profile-summaries' }]);
    });
  });

  describe('attachTargetProfiles', function () {
    it('should call the attachTargetProfilesTraining use-case', async function () {
      // given
      const trainingId = 145;
      const targetProfileIds = [1, 2, 3];
      sinon.stub(usecases, 'attachTargetProfilesToTraining').resolves(targetProfileIds);

      // when
      const response = await trainingController.attachTargetProfiles(
        {
          params: { id: trainingId },
          payload: { 'target-profile-ids': targetProfileIds },
        },
        hFake,
      );

      // then
      expect(response.statusCode).to.equal(204);
      expect(usecases.attachTargetProfilesToTraining).to.have.been.calledWithExactly({ trainingId, targetProfileIds });
    });
  });

  describe('#findPaginatedTrainingsSummariesByTargetProfileId', function () {
    it('should return trainings summaries', async function () {
      // given
      const targetProfileId = 123;
      const useCaseParameters = {
        targetProfileId,
        page: { size: 2, number: 1 },
      };

      sinon.stub(usecases, 'findPaginatedTargetProfileTrainingSummaries').resolves({
        trainings: [{ id: 1 }],
        meta: { page: 1 },
      });

      // when
      const response = await trainingController.findPaginatedTrainingsSummariesByTargetProfileId(
        {
          params: {
            id: targetProfileId,
          },
          query: {
            page: { size: 2, number: 1 },
          },
        },
        hFake,
      );

      // then
      expect(usecases.findPaginatedTargetProfileTrainingSummaries).to.have.been.calledWithExactly(useCaseParameters);
      expect(response.data).to.deep.equal([{ id: '1', type: 'training-summaries' }]);
      expect(response.meta).to.deep.equal({ page: 1 });
    });
  });

  describe('#deleteTrainingTrigger', function () {
    it('should call the deleteTrigger use-case', async function () {
      // given
      const trainingTriggerId = 'trigger-123';
      const trainingId = 'training-123';
      sinon.stub(usecases, 'deleteTrainingTrigger').resolves();

      // when
      const response = await trainingController.deleteTrainingTrigger(
        {
          params: { trainingTriggerId, trainingId },
        },
        hFake,
      );

      // then
      expect(usecases.deleteTrainingTrigger).to.have.been.calledWithExactly({
        trainingTriggerId,
        trainingId,
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});
