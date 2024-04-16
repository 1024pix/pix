import badgeCriteriaController from '../../../../../src/evaluation/application/badge-criteria/badge-criteria-controller.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | badge-criteria-controller', function () {
  describe('#updateCriterion', function () {
    it('should call the appropriate usecase', async function () {
      // given
      const deserializedPayload = {
        badgeId: 111,
        name: 'Dummy name',
        threshold: 10,
      };

      const badgeCriterionSerializer = {
        deserialize: sinon.stub().returns(deserializedPayload),
      };

      const badgeCriterion = Symbol('badgeCriterion');
      sinon.stub(evaluationUsecases, 'updateBadgeCriterion').resolves(badgeCriterion);

      const dependencies = { usecases: evaluationUsecases, badgeCriterionSerializer };

      // when
      const response = await badgeCriteriaController.updateCriterion(
        {
          params: {
            badgeCriterionId: 1,
          },
          payload: {
            data: {
              type: 'badge-criteria',
              attributes: {
                name: 'Dummy name',
                threshold: 10,
              },
              relationships: {
                badge: {
                  data: {
                    type: 'badges',
                    id: 111,
                  },
                },
              },
            },
          },
        },
        hFake,
        dependencies,
      );

      // then
      expect(badgeCriterionSerializer.deserialize).to.have.been.calledOnce;
      expect(evaluationUsecases.updateBadgeCriterion).to.have.been.calledOnceWithExactly({
        id: 1,
        badgeId: deserializedPayload.badgeId,
        attributesToUpdate: {
          name: deserializedPayload.name,
          threshold: deserializedPayload.threshold,
        },
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});
