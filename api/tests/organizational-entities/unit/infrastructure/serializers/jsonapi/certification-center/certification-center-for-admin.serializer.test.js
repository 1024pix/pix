import * as serializer from '../../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/certification-center/certification-center-for-admin.serializer.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

describe('Unit | Organizational Entities | Infrastructure | Serializer | JSONAPI | certification-center-for-admin-serializer', function () {
  let certificationCenterJsonApi;
  let centerForAdmin;
  let dataProtectionOfficer;
  let archivistFullName;

  beforeEach(function () {
    certificationCenterJsonApi = {
      data: {
        type: 'certification-centers',
        id: '123',
        attributes: {
          name: 'Centre des dés',
          type: 'SCO',
          'external-id': '12345',
          'created-at': new Date('2018-02-01T01:02:03Z'),
          'archived-at': null,
          'archivist-full-name': null,
          'data-protection-officer-first-name': 'Justin',
          'data-protection-officer-last-name': 'Ptipeu',
          'data-protection-officer-email': 'justin.ptipeu@example.net',
          'is-complementary-alone-pilot': false,
        },
        relationships: {},
      },
    };

    centerForAdmin = {
      id: 123,
      name: 'Centre des dés',
      type: 'SCO',
      externalId: '12345',
      createdAt: null,
      habilitations: [],
      archivedAt: null,
      isComplementaryAlonePilot: false,
    };

    archivistFullName = null;
    dataProtectionOfficer = { firstName: 'Justin', lastName: 'Ptipeu', email: 'justin.ptipeu@example.net' };
  });

  describe('#deserialize', function () {
    it('should convert a JSON API data into a CertificationCenterForAdmin model object', function () {
      // when
      const deserializedCertificationCenterForAdmin = serializer.deserialize(certificationCenterJsonApi);

      // then
      const expectedCertificationCenterForAdmin = domainBuilder.buildCenterForAdmin({
        center: {
          ...centerForAdmin,
          id: '123',
        },
        archivistFullName,
        dataProtectionOfficer,
      });

      expect(deserializedCertificationCenterForAdmin).to.deepEqualInstance(expectedCertificationCenterForAdmin);
    });

    describe('#serialize', function () {
      it('should convert a CertificationCenterForAdmin model object into JSON API data', function () {
        // given
        const complementaryCertification = domainBuilder.certification.enrolment.buildHabilitation({
          id: 1,
          label: 'Pix+surf',
          key: 'SURF',
        });
        const certificationCenter = domainBuilder.buildCenterForAdmin({
          center: {
            ...centerForAdmin,
            createdAt: new Date('2018-01-01T05:43:10Z'),
            habilitations: [complementaryCertification],
          },
          archivistFullName,
          dataProtectionOfficer,
        });

        // when
        const serializedCertificationCenter = serializer.serialize(certificationCenter);

        // then
        certificationCenterJsonApi.data.attributes['created-at'] = new Date('2018-01-01T05:43:10Z');
        certificationCenterJsonApi.data.relationships = {
          'certification-center-memberships': {
            links: {
              related: `/api/admin/certification-centers/${certificationCenter.id}/certification-center-memberships`,
            },
          },
          habilitations: {
            data: [
              {
                id: '1',
                type: 'complementary-certifications',
              },
            ],
          },
        };
        certificationCenterJsonApi.included = [
          {
            id: '1',
            type: 'complementary-certifications',
            attributes: {
              key: 'SURF',
              label: 'Pix+surf',
            },
          },
        ];

        expect(serializedCertificationCenter).to.deep.equal(certificationCenterJsonApi);
      });
    });
  });

  describe('when the center is for a complementary alone pilot', function () {
    describe('#serialize', function () {
      it('should return that the center is a complementary alone pilot into JSON API data', function () {
        // given
        const certificationCenter = domainBuilder.buildCenterForAdmin({
          center: {
            ...centerForAdmin,
            isComplementaryAlonePilot: true,
          },
          archivistFullName,
          dataProtectionOfficer,
        });

        // when
        const serializedCertificationCenter = serializer.serialize(certificationCenter);

        // then
        expect(serializedCertificationCenter.data.attributes['is-complementary-alone-pilot']).to.be.true;
      });
    });
  });
});
