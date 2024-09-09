import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../test-helper.js';

const CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME = 'certification-center-invitations';

describe('Acceptance | API | Certification center invitations', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  context('global routes', function () {
    describe(`PATCH /api/certification-center-invitations/{id}`, function () {
      context('when user is admin of the certification center', function () {
        let adminUser;
        let certificationCenter;

        beforeEach(async function () {
          adminUser = databaseBuilder.factory.buildUser();
          certificationCenter = databaseBuilder.factory.buildCertificationCenter();
          databaseBuilder.factory.buildCertificationCenterMembership({
            userId: adminUser.id,
            certificationCenterId: certificationCenter.id,
            role: 'ADMIN',
          });

          await databaseBuilder.commit();
        });

        it('returns a 200 HTTP status code with updated certification center invitation', async function () {
          // given
          const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
            certificationCenterId: certificationCenter.id,
          });

          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'PATCH',
            url: `/api/certification-center-invitations/${certificationCenterInvitation.id}`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(adminUser.id),
            },
          });

          // then
          const updatedCertificationCenterInvitation = await knex(CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME)
            .where({ id: certificationCenterInvitation.id })
            .first();

          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal({
            data: {
              type: 'certification-center-invitations',
              id: `${updatedCertificationCenterInvitation.id}`,
              attributes: {
                email: updatedCertificationCenterInvitation.email,
                role: updatedCertificationCenterInvitation.role,
                'updated-at': updatedCertificationCenterInvitation.updatedAt,
              },
            },
          });
        });
      });

      context('when user is not admin of the certification center', function () {
        let user;
        let certificationCenter;

        beforeEach(async function () {
          user = databaseBuilder.factory.buildUser();
          certificationCenter = databaseBuilder.factory.buildCertificationCenter();
          databaseBuilder.factory.buildCertificationCenterMembership({
            userId: user.id,
            certificationCenterId: certificationCenter.id,
            role: 'MEMBER',
          });

          await databaseBuilder.commit();
        });

        it('returns a 403 HTTP status code', async function () {
          // given
          const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
            certificationCenterId: certificationCenter.id,
          });

          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'PATCH',
            url: `/api/certification-center-invitations/${certificationCenterInvitation.id}`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(user.id),
            },
          });

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
