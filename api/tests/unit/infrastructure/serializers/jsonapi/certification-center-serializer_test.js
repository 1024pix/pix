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
        id: certificationCenterId,
        name: certificationCenterName,
        createdAt: certificationCenterDate,
        fakeProperty: 'fakeProperty'
      });

      const expectedSerializedCertificationCenter = {
        data: {
          type: 'certification-centers',
          id: certificationCenterId,
          attributes: {
            id: certificationCenterId,
            name: certificationCenterName,
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
          id: certificationCenterId,
          attributes: {
            name: certificationCenterName,
            'created-at': '2018-20'
          },
          relationships: {}
        }
      };

      // when
      const deserializedCertificationCenter = serializer.deserialize(jsonApi);

      // then
      expect(deserializedCertificationCenter).to.be.instanceOf(CertificationCenter);
      expect(deserializedCertificationCenter.id).to.equal(certificationCenterId);
      expect(deserializedCertificationCenter.name).to.equal(certificationCenterName);
      expect(deserializedCertificationCenter.createdAt).to.be.undefined;
    });

  });

});
