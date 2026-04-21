import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | answer-controller-update', function () {
  describe('PATCH /api/answers/:id', function () {
    let options;

    beforeEach(async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
      const answer = databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        value: '1.2',
        result: 'ok',
        challengeId: 'rec1',
      });
      await databaseBuilder.commit();
      options = {
        method: 'PATCH',
        url: '/api/answers/' + answer.id,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };
    });

    it('should return 200 HTTP status code', function () {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
