import { sinon, expect, hFake } from '../../../test-helper';
import controller from '../../../../lib/application/assessments/assessment-controller';
import assessmentRepository from '../../../../lib/infrastructure/repositories/assessment-repository';
import Assessment from '../../../../lib/domain/models/Assessment';

describe('Unit | Controller | assessment-controller-save', function () {
  describe('#save', function () {
    context('when the assessment saved is a preview test', function () {
      const request = {
        headers: {
          authorization: 'Bearer my-token',
        },
        payload: {
          data: {
            id: 42,
            attributes: {
              'estimated-level': 4,
              'pix-score': 4,
              type: 'PREVIEW',
            },
            relationships: {
              course: {
                data: {
                  id: 'null-preview-id',
                },
              },
            },
          },
        },
      };

      beforeEach(function () {
        sinon.stub(assessmentRepository, 'save').resolves({});
      });

      it('should save an assessment with type PREVIEW', async function () {
        // given
        const expected = new Assessment({
          id: 42,
          courseId: null,
          type: 'PREVIEW',
          userId: null,
          state: 'started',
          method: 'CHOSEN',
        });

        // when
        await controller.save(request, hFake);

        // then
        expect(assessmentRepository.save).to.have.been.calledWith({ assessment: expected });
      });
    });
  });
});
