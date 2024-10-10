import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../../test-helper.js';

describe('Certification | Evaluation | Acceptance | Application | Routes | companion-alert', function () {
  describe('POST /api/assessments/{assessmentId}/companion-alert', function () {
    let server;
    let user;
    let assessment;
    let options;

    beforeEach(async function () {
      server = await createServer();
      user = databaseBuilder.factory.buildUser();
      assessment = databaseBuilder.factory.buildAssessment({
        state: Assessment.states.STARTED,
        userId: user.id,
      });
      options = {
        method: 'POST',
        url: `/api/assessments/${assessment.id}/companion-alert`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      return databaseBuilder.commit();
    });

    it('should respond with a 401 if requested user is not the same as the user of the assessment', async function () {
      // given
      const otherUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);
      options.payload = {};

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should save a companion alert', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      const certificationCompanionAlert = await knex
        .select('assessmentId', 'status')
        .from('certification-companion-live-alerts')
        .first();
      expect(certificationCompanionAlert).to.deep.equal({
        assessmentId: assessment.id,
        status: 'ONGOING',
      });
    });
  });
});
