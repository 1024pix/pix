import { createServer } from '../../../../server.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Deprecated | Application | Route | Certification point of contact', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/certification-point-of-contacts/me', function () {
    it('returns a 200 HTTP status code', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId: 'EX123' }).id;
      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      }).id;
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: complementaryCertification.id,
      });

      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/certification-point-of-contacts/me',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal(userId.toString());
      expect(response.result.data.attributes.lang).to.equal('fr');

      expect(response.result.data.relationships).to.deep.include({
        'certification-center-memberships': {
          data: [
            {
              id: certificationCenterMembershipId.toString(),
              type: 'certification-center-membership',
            },
          ],
        },
      });

      expect(response.result.included).to.deep.have.members([
        {
          attributes: {
            'external-id': 'EX123',
            habilitations: [
              {
                id: complementaryCertification.id,
                label: complementaryCertification.label,
                key: complementaryCertification.key,
              },
            ],
            'is-access-blocked-aefe': false,
            'is-access-blocked-agri': false,
            'is-access-blocked-college': false,
            'is-access-blocked-lycee': false,
            'is-related-to-managing-students-organization': false,
            name: 'some name',
            'pix-certif-sco-blocked-access-date-college': null,
            'pix-certif-sco-blocked-access-date-lycee': null,
            'related-organization-tags': [],
            type: 'SUP',
          },
          id: certificationCenterId.toString(),
          type: 'allowed-certification-center-access',
        },
        {
          id: certificationCenterMembershipId.toString(),
          type: 'certification-center-membership',
          attributes: {
            'certification-center-id': certificationCenterId,
            'user-id': userId,
            role: 'MEMBER',
          },
        },
      ]);
    });
  });
});
