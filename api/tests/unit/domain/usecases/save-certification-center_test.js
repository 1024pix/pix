const { expect, domainBuilder, sinon } = require('../../../test-helper');
const saveCertificationCenter = require('../../../../lib/domain/usecases/save-certification-center');
const certificationCenterCreationValidator = require('../../../../lib/domain/validators/certification-center-creation-validator');

describe('Unit | UseCase | save-certification-center', function () {
  describe('#saveCertificationCenter', function () {
    context('when there are no associated accreditation', function () {
      it('should save the certification center', async function () {
        // given
        const certificationCenter = domainBuilder.buildCertificationCenter();
        const validatorStub = sinon.stub(certificationCenterCreationValidator, 'validate');
        const certificationCenterRepository = { save: sinon.stub().returns(certificationCenter) };
        const grantedAccreditationRepository = {
          deleteByCertificationCenterId: sinon.stub(),
          save: sinon.stub().returns(certificationCenter),
        };

        // when
        const savedCertificationCenter = await saveCertificationCenter({
          certificationCenter,
          certificationCenterRepository,
          grantedAccreditationRepository,
        });

        // then
        expect(validatorStub).to.be.calledOnceWith(certificationCenter);
        expect(certificationCenterRepository.save).to.be.calledOnceWith(certificationCenter);
        expect(savedCertificationCenter).to.equal(certificationCenter);
      });
    });

    context('when there are associated accreditations', function () {
      it('should reset existing granted accreditation and create new ones', async function () {
        // given
        const certificationCenter = domainBuilder.buildCertificationCenter();
        const accreditation1 = domainBuilder.buildAccreditation();
        const accreditation2 = domainBuilder.buildAccreditation();
        const grantedAccreditation1 = domainBuilder.buildGrantedAccreditation({
          accreditationId: accreditation1.id,
          certificationCenterId: certificationCenter.id,
        });
        const grantedAccreditation2 = domainBuilder.buildGrantedAccreditation({
          accreditationId: accreditation2.id,
          certificationCenterId: certificationCenter.id,
        });
        grantedAccreditation1.id = undefined;
        grantedAccreditation2.id = undefined;
        const validatorStub = sinon.stub(certificationCenterCreationValidator, 'validate');
        const certificationCenterRepository = { save: sinon.stub().returns(certificationCenter) };
        const grantedAccreditationRepository = { deleteByCertificationCenterId: sinon.stub(), save: sinon.stub() };

        // when
        const savedCertificationCenter = await saveCertificationCenter({
          certificationCenter,
          accreditations: [accreditation1, accreditation2],
          certificationCenterRepository,
          grantedAccreditationRepository,
        });

        // then
        expect(validatorStub).to.be.calledOnceWith(certificationCenter);
        expect(certificationCenterRepository.save).to.be.calledOnceWith(certificationCenter);
        expect(grantedAccreditationRepository.deleteByCertificationCenterId).to.be.calledOnceWith(
          certificationCenter.id
        );
        expect(grantedAccreditationRepository.save).to.be.calledWith(grantedAccreditation1);
        expect(grantedAccreditationRepository.save).to.be.calledWith(grantedAccreditation2);
        expect(savedCertificationCenter).to.equal(certificationCenter);
      });
    });
  });
});
