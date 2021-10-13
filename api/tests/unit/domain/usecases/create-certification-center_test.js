const { expect, domainBuilder, sinon } = require('../../../test-helper');
const createCertificationCenter = require('../../../../lib/domain/usecases/create-certification-center');

describe('Unit | UseCase | create-certification-center', function () {
  describe('#createCertificationCenter', function () {
    it('should save and return the certification center', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const certificationCenterRepository = { save: sinon.stub().returns(certificationCenter) };
      const grantedAccreditationRepository = {};

      // when
      const createdCertificationCenter = await createCertificationCenter({
        certificationCenter,
        accreditationIds: [],
        certificationCenterRepository,
        grantedAccreditationRepository,
      });

      // then
      expect(certificationCenterRepository.save).to.be.calledOnceWith(certificationCenter);
      expect(createdCertificationCenter).to.deepEqualInstance(certificationCenter);
    });

    it('should save the granted accreditations', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const accreditationIds = ['1234', '4567'];
      const certificationCenterRepository = { save: sinon.stub().returns(certificationCenter) };
      const grantedAccreditationRepository = {
        save: sinon.stub(),
      };

      // when
      await createCertificationCenter({
        certificationCenter,
        accreditationIds,
        certificationCenterRepository,
        grantedAccreditationRepository,
      });

      // then
      expect(grantedAccreditationRepository.save).to.be.calledTwice;
    });
  });
});
