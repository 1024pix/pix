import { CERTIFICATION_FEATURES } from '../../../../src/certification/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

describe('Acceptance | Route | CertificationPointOfContact', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/certification-point-of-contacts/me', function () {
    it('should 200 HTTP status code', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId: 'EX123' }).id;
      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      }).id;
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        hasComplementaryReferential: true,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId: complementaryCertification.id,
      });

      // Pilot complementary
      const certificationCenterComplementaryAlonePilotId = databaseBuilder.factory.buildCertificationCenter({
        externalId: 'PILOT123',
      }).id;
      const complementaryAlonePilotFeatureId = databaseBuilder.factory.buildFeature(
        CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE,
      ).id;
      databaseBuilder.factory.buildCertificationCenterFeature({
        certificationCenterId: certificationCenterComplementaryAlonePilotId,
        featureId: complementaryAlonePilotFeatureId,
      });
      const certificationCenterMembershipComplementaryAlonePilotId =
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId: certificationCenterComplementaryAlonePilotId,
        }).id;

      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/certification-point-of-contacts/me',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
            {
              id: certificationCenterMembershipComplementaryAlonePilotId.toString(),
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
                hasComplementaryReferential: true,
              },
            ],
            'is-access-blocked-aefe': false,
            'is-access-blocked-agri': false,
            'is-access-blocked-college': false,
            'is-access-blocked-lycee': false,
            'is-related-to-managing-students-organization': false,
            'is-v3-pilot': false,
            'is-complementary-alone-pilot': false,
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
          attributes: {
            'external-id': 'PILOT123',
            habilitations: [],
            'is-access-blocked-aefe': false,
            'is-access-blocked-agri': false,
            'is-access-blocked-college': false,
            'is-access-blocked-lycee': false,
            'is-related-to-managing-students-organization': false,
            'is-v3-pilot': false,
            'is-complementary-alone-pilot': true,
            name: 'some name',
            'pix-certif-sco-blocked-access-date-college': null,
            'pix-certif-sco-blocked-access-date-lycee': null,
            'related-organization-tags': [],
            type: 'SUP',
          },
          id: certificationCenterComplementaryAlonePilotId.toString(),
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
        {
          id: certificationCenterMembershipComplementaryAlonePilotId.toString(),
          type: 'certification-center-membership',
          attributes: {
            'certification-center-id': certificationCenterComplementaryAlonePilotId,
            'user-id': userId,
            role: 'MEMBER',
          },
        },
      ]);
    });
  });
});
