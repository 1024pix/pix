import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

describe('Acceptance | Identity Access Management | Application | Route | Admin | Anonymization', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/anonymize/gar', function () {
    context('when a CSV file is loaded', function () {
      it('responds with a 200 and serialized payload', async function () {
        // given
        const user = await insertUserWithRoleSuperAdmin();

        const userId1 = databaseBuilder.factory.buildUser().id;
        const userId2 = databaseBuilder.factory.buildUser().id;
        const userId3 = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId: userId1,
          externalIdentifier: 'externalId1',
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId: userId2,
          externalIdentifier: 'externalId2',
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId: userId3,
          externalIdentifier: 'externalId3',
        });
        await databaseBuilder.commit();

        const input = `User ID
      ${userId1}
      ${userId2}
      ${userId3}
      `;

        const options = {
          method: 'POST',
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          url: '/api/admin/anonymize/gar',
          payload: input,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal({
          type: 'anonymize-gar-results',
          attributes: {
            anonymized: 3,
            total: 3,
          },
        });
      });
    });
  });
});
