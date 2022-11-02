const { sinon, expect, hFake } = require('../../../test-helper');

const trainingController = require('../../../../lib/application/trainings/training-controller');
const usecases = require('../../../../lib/domain/usecases');
const trainingSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/training-serializer');

describe('Unit | Controller | training-controller', function () {
  describe('#update', function () {
    const deserializedTraining = { title: 'new title' };
    const updatedTraining = { title: 'new title' };

    beforeEach(function () {
      sinon.stub(trainingSerializer, 'deserialize').returns(deserializedTraining);
      sinon.stub(trainingSerializer, 'serialize');
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
          hFake
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
          hFake
        );

        // then
        expect(trainingSerializer.serialize).to.have.been.calledWith(updatedTraining);
        expect(response).to.deep.equal(expectedSerializedUser);
      });
    });
  });
});
