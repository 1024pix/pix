import { createServer, databaseBuilder, expect } from '../../../../test-helper.js';

import { Assessment } from '../../../../../lib/domain/models/index.js';

describe('Acceptance | Controller | assessment-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /assessments/{id}/current-activity', function () {
    context('when the assessment is completed', function () {
      it('should return a 412 HTTP status code for PreconditionFailedError', async function () {
        // given
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.PIX1D_MISSION,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/pix1d/assessments/${assessmentId}/current-activity`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });

    context('when the assessment is in progress', function () {
      it('should return current-activity', async function () {
        // given
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.PIX1D_MISSION,
          state: Assessment.states.STARTED,
        });
        const { id: activityId } = databaseBuilder.factory.buildActivity({ assessmentId });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/pix1d/assessments/${assessmentId}/current-activity`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.id).to.equal(activityId.toString());
      });
    });
  });
});
