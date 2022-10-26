const { databaseBuilder, expect, knex } = require('../../../test-helper');
const CertificationCenterInvitation = require('../../../../lib/domain/models/CertificationCenterInvitation');
const createServer = require('../../../../server');

describe('Acceptance | API | Certification center invitations', function () {
  afterEach(async function () {
    await knex('certification-center-memberships').delete();
  });

  describe('POST /api/certification-center-invitations/{id}/accept', function () {
    it('it should return an HTTP code 204', async function () {
      // given
      const server = await createServer();
      databaseBuilder.factory.buildUser({ id: 293, email: 'user@example.net' });
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        id: 123,
        code: 'AZERT123',
        certificationCenterId: certificationCenter.id,
        status: CertificationCenterInvitation.StatusType.PENDING,
      });

      await databaseBuilder.commit();

      // when
      const result = await server.inject({
        headers: {
          authorization: false,
        },
        method: 'POST',
        url: `/api/certification-center-invitations/${certificationCenterInvitation.id}/accept`,
        payload: {
          data: {
            id: '123_AZERT123',
            type: 'certification-center-invitations-responses',
            attributes: {
              code: 'AZERT123',
              email: 'user@example.net',
            },
          },
        },
      });

      // then
      expect(result.statusCode).to.equal(204);

      const membership = await knex('certification-center-memberships')
        .select('userId')
        .where({ certificationCenterId: certificationCenter.id })
        .first();
      const invitation = await knex('certification-center-invitations')
        .select('status')
        .where({ certificationCenterId: certificationCenter.id })
        .first();

      expect(membership.userId).to.equal(293);
      expect(invitation.status).to.equal(CertificationCenterInvitation.StatusType.ACCEPTED);
    });
  });
});
