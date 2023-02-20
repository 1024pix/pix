import { knex, expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | sessions-controller', function () {
  describe('DELETE /sessions/{id}', function () {
    it('should respond with 204', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;

      const { id: certificationCenterId, name: certificationCenter } =
        databaseBuilder.factory.buildCertificationCenter();

      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId, certificationCenter }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

      await databaseBuilder.commit();
      const options = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
        method: 'DELETE',
        url: `/api/sessions/${sessionId}`,
      };

      // when
      const response = await server.inject(options);

      // then

      const session = await knex('sessions').where({ id: sessionId }).first();

      expect(response.statusCode).to.equal(204);
      expect(session).to.be.undefined;
    });
  });
});
