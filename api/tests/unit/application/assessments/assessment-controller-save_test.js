const { sinon, expect, hFake } = require('../../../test-helper');

const controller = require('../../../../lib/application/assessments/assessment-controller');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const Assessment = require('../../../../lib/domain/models/Assessment');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | assessment-controller-save', () => {

  describe('#save', () => {

    context('when the assessment saved is a smart placement', () => {

      const request = {
        headers: {
          authorization: 'Bearer my-token',
        },
        payload: {
          data: {
            id: 42,
            attributes: {
              'type': 'SMART_PLACEMENT',
              'code-campaign': 'CODECAMPAIGN',
              'participant-external-id': 'matricule123',
            },
          },
        },
      };

      beforeEach(() => {
        sinon.stub(usecases, 'createAssessmentForCampaign').resolves({});
      });

      it('should save an assessment with the type SMART_PLACEMENT and with a fake courseId', async function() {
        // given
        const expectedAssessment = new Assessment({
          id: 42,
          courseId: null,
          type: 'SMART_PLACEMENT',
          state: undefined,
          userId: null,
        });

        const expectedCallArguments = {
          assessment: expectedAssessment,
          codeCampaign: 'CODECAMPAIGN',
          participantExternalId: 'matricule123',
        };
        // when
        await controller.save(request, hFake);

        // then
        sinon.assert.calledOnce(usecases.createAssessmentForCampaign);
        sinon.assert.calledWith(usecases.createAssessmentForCampaign, expectedCallArguments);
      });
    });

    context('when the assessment saved is a preview test', () => {
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
              'type': 'PREVIEW',
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

      beforeEach(() => {
        sinon.stub(assessmentRepository, 'save').resolves({});
      });

      it('should save an assessment with type PREVIEW', async function() {
        // given
        const expected = new Assessment({
          id: 42,
          courseId: null,
          type: 'PREVIEW',
          userId: null,
          state: 'started',
        });

        // when
        await controller.save(request, hFake);

        // then
        expect(assessmentRepository.save).to.have.been.calledWith({ assessment: expected });
      });
    });
  });
});
