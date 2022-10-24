const { expect, databaseBuilder } = require('../../test-helper');

const CertificationCenterInvitation = require('../../../lib/domain/models/CertificationCenterInvitation');

const createServer = require('../../../server');

describe('Acceptance | Application | certification-center-invitation-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/certification-center-invitations/{id}', function () {
    it('should return the certification-center invitation and 200 status code', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Centre des Pixous' }).id;
      const certificationCenterInvitationId = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId,
        status: CertificationCenterInvitation.StatusType.PENDING,
        code: 'ABCDEFGH01',
      }).id;

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/certification-center-invitations/${certificationCenterInvitationId}?code=ABCDEFGH01`,
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'certification-center-invitations',
          id: certificationCenterInvitationId.toString(),
          attributes: {
            'certification-center-id': certificationCenterId,
            'certification-center-name': 'Centre des Pixous',
            status: CertificationCenterInvitation.StatusType.PENDING,
          },
        },
      });
    });
  });
});
