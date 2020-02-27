const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-center-serializer');
const CertificationCenter = require('../../../../../lib/domain/models/CertificationCenter');

describe('Unit | Serializer | JSONAPI | certification-center-serializer', function() {

  let certificationCenterId;
  let certificationCenterName;
  let certificationCenterDate;

  beforeEach(() => {
    certificationCenterId = 42;
    certificationCenterName = 'My certification center';
    certificationCenterDate = 'Some date';
  });

  describe('#serialize', function() {

    it('should convert a Certification Center model object into JSON API data', function() {
      // given
      const certificationCenter = new CertificationCenter({
        id: certificationCenterId.toString(),
        name: certificationCenterName,
        createdAt: certificationCenterDate,
        fakeProperty: 'fakeProperty'
      });

      const expectedSerializedCertificationCenter = {
        data: {
          type: 'certification-centers',
          id: certificationCenterId.toString(),
          attributes: {
            id: certificationCenterId.toString(),
            name: certificationCenterName,
            type: undefined,
            'external-id': undefined,
            'created-at': certificationCenterDate,
          },
        }
      };

      // when
      const serializedCertificationCenter = serializer.serialize(certificationCenter);

      // then
      expect(serializedCertificationCenter).to.deep.equal(expectedSerializedCertificationCenter);
    });

  });

  describe('#deserialize', function() {

    it('should convert JSON API certification center data into a Certification Center model object', function() {
      // given
      const jsonApi = {
        data: {
          type: 'certification-centers',
          id: certificationCenterId.toString(),
          attributes: {
            name: certificationCenterName,
            'created-at': new Date('2018-02-01T01:02:03Z')
          },
          relationships: {}
        }
      };

      // when
      const deserializedCertificationCenter = serializer.deserialize(jsonApi);

      // then
      expect(deserializedCertificationCenter).to.be.instanceOf(CertificationCenter);
      expect(deserializedCertificationCenter.id).to.equal(certificationCenterId.toString());
      expect(deserializedCertificationCenter.name).to.equal(certificationCenterName);
      expect(deserializedCertificationCenter.createdAt).to.be.undefined;
    });

  });

});
