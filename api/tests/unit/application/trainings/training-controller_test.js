const { sinon, expect, hFake } = require('../../../test-helper');
const trainingController = require('../../../../lib/application/trainings/training-controller');
const usecases = require('../../../../lib/domain/usecases/index.js');
const TrainingTrigger = require('../../../../lib/domain/models/TrainingTrigger');

describe('Unit | Controller | training-controller', function () {
  describe('#findPaginatedTrainingSummaries', function () {
    it('should call the training findPaginatedTrainingSummaries use-case', async function () {
      // given
      const expectedResult = Symbol('serialized-training-summaries');
      const trainingSummaries = Symbol('trainingSummary');
      const meta = Symbol('meta');
      const useCaseParameters = {
        page: { size: 2, number: 1 },
      };

      sinon.stub(usecases, 'findPaginatedTrainingSummaries').resolves({ trainings: trainingSummaries, meta });

      const trainingSummarySerializer = { serialize: sinon.stub() };
      const queryParamsUtils = { extractParameters: sinon.stub() };
      trainingSummarySerializer.serialize.returns(expectedResult);
      queryParamsUtils.extractParameters.returns(useCaseParameters);

      // when
      const response = await trainingController.findPaginatedTrainingSummaries(
        {
          params: {
            page: { size: 2, number: 1 },
          },
        },
        hFake,
        { trainingSummarySerializer, queryParamsUtils }
      );

      // then
      expect(usecases.findPaginatedTrainingSummaries).to.have.been.calledWith(useCaseParameters);
      expect(trainingSummarySerializer.serialize).to.have.been.calledOnce;
      expect(queryParamsUtils.extractParameters).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });

  describe('#getById', function () {
    it('should get training by id', async function () {
      // given
      const expectedResult = Symbol('serialized-trainings');
      const training = Symbol('training');
      const trainingId = 1;

      sinon.stub(usecases, 'getTraining').resolves(training);
      const trainingSerializer = { serializeForAdmin: sinon.stub() };
      trainingSerializer.serializeForAdmin.returns(expectedResult);

      // when
      const response = await trainingController.getById(
        {
          params: {
            trainingId,
          },
        },
        hFake,
        { trainingSerializer }
      );

      // then
      expect(usecases.getTraining).to.have.been.calledWith({ trainingId });
      expect(trainingSerializer.serializeForAdmin).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });

  describe('#create', function () {
    const deserializedTraining = {
      title: 'Training title',
      duration: '2d2h2m',
    };
    const createdTraining = {
      title: 'Training title',
      duration: {
        days: 2,
        hours: 2,
        minutes: 2,
      },
    };
    let trainingSerializer;

    beforeEach(function () {
      trainingSerializer = {
        deserialize: sinon.stub(),
        serialize: sinon.stub(),
      };
      trainingSerializer.deserialize.returns(deserializedTraining);
      sinon.stub(usecases, 'createTraining').resolves(createdTraining);
    });

    it('should call the training create use-case', async function () {
      // given
      const payload = {
        data: {
          attributes: {
            title: 'A new training',
            locale: 'fr',
            duration: {
              days: 2,
              hours: 2,
              minutes: 2,
            },
          },
        },
      };

      // when
      await trainingController.create({ payload }, hFake, { trainingSerializer });

      // then
      expect(trainingSerializer.deserialize).to.have.been.calledWith(payload);
      expect(usecases.createTraining).to.have.been.calledOnceWithExactly({ training: deserializedTraining });
    });

    it('should return a serialized training', async function () {
      // given
      const expectedSerializedTraining = {
        title: 'A new training',
        duration: {
          hours: 5,
        },
      };

      trainingSerializer.serialize.returns(expectedSerializedTraining);

      // when
      const response = await trainingController.create(
        {
          data: {
            attributes: {
              title: 'A new training',
              duration: {
                hours: 5,
              },
            },
          },
        },
        hFake,
        { trainingSerializer }
      );

      // then
      expect(trainingSerializer.serialize).to.have.been.calledWith(createdTraining);
      expect(response.source).to.deep.equal(expectedSerializedTraining);
    });
  });

  describe('#update', function () {
    const deserializedTraining = { title: 'new title' };
    const updatedTraining = { title: 'new title' };

    let trainingSerializer;

    beforeEach(function () {
      trainingSerializer = {
        serialize: sinon.stub(),
        deserialize: sinon.stub(),
      };
      trainingSerializer.deserialize.returns(deserializedTraining);
      sinon.stub(usecases, 'updateTraining').resolves(updatedTraining);
    });

    describe('when request is valid', function () {
      it('should call the training update use-case', async function () {
        // given
        const useCaseParameters = {
          training: { ...deserializedTraining, id: 134 },
        };
        const payload = {
          data: {
            attributes: {
              title: 'New title',
              link: 'https://example.net/new-link',
            },
          },
        };

        // when
        await trainingController.update(
          {
            params: {
              trainingId: 134,
            },
            payload,
          },
          hFake,
          { trainingSerializer }
        );

        // then
        expect(trainingSerializer.deserialize).to.have.been.calledWith(payload);
        expect(usecases.updateTraining).to.have.been.calledWith(useCaseParameters);
      });

      it('should return a serialized training', async function () {
        // given
        const payload = {
          data: {
            attributes: {
              title: 'New title',
              link: 'https://example.net/new-link',
            },
          },
        };
        const expectedSerializedUser = { message: 'serialized user' };
        trainingSerializer.serialize.returns(expectedSerializedUser);

        // when
        const response = await trainingController.update(
          {
            params: {
              trainingId: 134,
            },
            payload,
          },
          hFake,
          { trainingSerializer }
        );

        // then
        expect(trainingSerializer.serialize).to.have.been.calledWith(updatedTraining);
        expect(response).to.deep.equal(expectedSerializedUser);
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
          },
          relationships: {
            tubes: {
              data: [
                {
                  id: 'recTube123',
                  type: 'tubes',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              id: 'recTube123',
              level: 2,
            },
            id: 'recTube123',
            type: 'tubes',
          },
        ],
      };

      const deserializedTrigger = {
        trainingId: Symbol('trainingId'),
        threshold: Symbol('threshold'),
        type: Symbol('type'),
        tubes: Symbol('tubes'),
      };

      const createdTrigger = Symbol('createdTrigger');
      const serializedTrigger = Symbol('serializedTrigger');
      sinon.stub(usecases, 'createOrUpdateTrainingTrigger').resolves(createdTrigger);
      const trainingTriggerSerializer = {
        deserialize: sinon.stub(),
        serialize: sinon.stub(),
      };
      trainingTriggerSerializer.deserialize.withArgs(payload).returns(deserializedTrigger);
      trainingTriggerSerializer.serialize.withArgs(createdTrigger).returns(serializedTrigger);

      // when
      const result = await trainingController.createOrUpdateTrigger(
        {
          params: { trainingId: 145 },
          payload,
        },
        hFake,
        { trainingTriggerSerializer: trainingTriggerSerializer }
      );

      // then
      expect(usecases.createOrUpdateTrainingTrigger).to.have.been.calledWith({
        trainingId: 145,
        threshold: deserializedTrigger.threshold,
        type: deserializedTrigger.type,
        tubes: deserializedTrigger.tubes,
      });
      expect(result).to.be.equal(serializedTrigger);
    });
  });

  describe('#findTargetProfileSummaries', function () {
    it('should call the findTargetProfileSummaries use-case', async function () {
      // given
      const trainingId = 145;
      const targetProfileSummaries = Symbol('targetProfileSummaries');
      const serializedTargetProfileSummaries = Symbol('serializedTargetProfileSummaries');
      sinon.stub(usecases, 'findTargetProfileSummariesForTraining').resolves(targetProfileSummaries);

      const targetProfileSummaryForAdminSerializer = {
        serialize: sinon.stub(),
      };
      targetProfileSummaryForAdminSerializer.serialize
        .withArgs(targetProfileSummaries)
        .returns(serializedTargetProfileSummaries);

      // when
      const result = await trainingController.findTargetProfileSummaries({ params: { trainingId } }, hFake, {
        targetProfileSummaryForAdminSerializer: targetProfileSummaryForAdminSerializer,
      });

      // then
      expect(usecases.findTargetProfileSummariesForTraining).to.have.been.calledWith({ trainingId });
      expect(result).to.be.equal(serializedTargetProfileSummaries);
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
        hFake
      );

      // then
      expect(response.statusCode).to.equal(204);
      expect(usecases.attachTargetProfilesToTraining).to.have.been.calledWith({ trainingId, targetProfileIds });
    });
  });
});
