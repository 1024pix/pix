import { sinon, expect, hFake } from '../../../../test-helper.js';
import { assessmentController as controller } from '../../../../../src/shared/application/assessments/assessment-controller.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

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
      let assessmentRepositoryStub;

      beforeEach(function () {
        assessmentRepositoryStub = { save: sinon.stub() };
        assessmentRepositoryStub.save.resolves({});
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
        await controller.save(request, hFake, { assessmentRepository: assessmentRepositoryStub });

        // then
        expect(assessmentRepositoryStub.save).to.have.been.calledWithExactly({ assessment: expected });
      });
    });
  });
});
