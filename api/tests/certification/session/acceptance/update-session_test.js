import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | session | update-session', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/sessions/{id}', function () {
    let user, unauthorizedUser, certificationCenter, session, payload;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser();
      unauthorizedUser = databaseBuilder.factory.buildUser();
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: user.id,
        certificationCenterId: certificationCenter.id,
      });
      session = databaseBuilder.factory.buildSession({
        certificationCenter: certificationCenter.name,
        certificationCenterId: certificationCenter.id,
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        accessCode: 'ABCD12',
      });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
      });
      payload = {
        data: {
          id: session.id,
          type: 'sessions',
          attributes: {
            address: 'New address',
            room: 'New room',
            examiner: 'Antoine Toutvenant',
            date: '2017-08-12',
            time: '14:30',
            description: 'ahah',
            accessCode: 'ABCD12',
          },
        },
      };

      await databaseBuilder.commit();
    });

    it('should respond with a 200 and update the session', function () {
      const options = {
        method: 'PATCH',
        url: `/api/sessions/${session.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('sessions');
        expect(response.result.data.id).to.equal(session.id.toString());
        expect(response.result.data.attributes.address).to.equal('New address');
        expect(response.result.data.attributes.room).to.equal('New room');
      });
    });

    it('should respond with a 404 when user is not authorized to update the session (to keep opacity on whether forbidden or not found)', function () {
      const options = {
        method: 'PATCH',
        url: `/api/sessions/${session.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(unauthorizedUser.id) },
        payload,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
