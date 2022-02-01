const { expect, domainBuilder, sinon } = require('../../../test-helper');
const updateCertificationCenter = require('../../../../lib/domain/usecases/update-certification-center');
const certificationCenterCreationValidator = require('../../../../lib/domain/validators/certification-center-creation-validator');

describe('Unit | UseCase | update-certification-center', function () {
  describe('#updateCertificationCenter', function () {
    context('when there are no associated complementary certitification habilitation', function () {
      it('should save the certification center', async function () {
        // given
        const certificationCenter = domainBuilder.buildCertificationCenter();
        const validatorStub = sinon.stub(certificationCenterCreationValidator, 'validate');
        const certificationCenterRepository = { save: sinon.stub().returns(certificationCenter) };
        const complementaryCertificationHabilitationRepository = {
          deleteByCertificationCenterId: sinon.stub(),
          save: sinon.stub().returns(certificationCenter),
        };

        // when
        const savedCertificationCenter = await updateCertificationCenter({
          certificationCenter,
          certificationCenterRepository,
          complementaryCertificationHabilitationRepository,
        });

        // then
        expect(validatorStub).to.be.calledOnceWith(certificationCenter);
        expect(certificationCenterRepository.save).to.be.calledOnceWith(certificationCenter);
        expect(savedCertificationCenter).to.equal(certificationCenter);
      });
    });

    context('when there are associated habilitations', function () {
      it('should reset existing complementary certitification habilitation and create new ones', async function () {
        // given
        const certificationCenter = domainBuilder.buildCertificationCenter();
        const complementaryCertificationIds = ['1234', '5678'];
        const complementaryCertificationHabilitation1 = domainBuilder.buildComplementaryCertificationHabilitation({
          complementaryCertificationId: 1234,
          certificationCenterId: certificationCenter.id,
        });
        const complementaryCertificationHabilitation2 = domainBuilder.buildComplementaryCertificationHabilitation({
          complementaryCertificationId: 5678,
          certificationCenterId: certificationCenter.id,
        });
        complementaryCertificationHabilitation1.id = undefined;
        complementaryCertificationHabilitation2.id = undefined;
        const validatorStub = sinon.stub(certificationCenterCreationValidator, 'validate');
        const certificationCenterRepository = { save: sinon.stub().returns(certificationCenter) };
        const complementaryCertificationHabilitationRepository = {
          deleteByCertificationCenterId: sinon.stub(),
          save: sinon.stub(),
        };

        // when
        const savedCertificationCenter = await updateCertificationCenter({
          certificationCenter,
          complementaryCertificationIds,
          certificationCenterRepository,
          complementaryCertificationHabilitationRepository,
        });

        // then
        expect(validatorStub).to.be.calledOnceWith(certificationCenter);
        expect(certificationCenterRepository.save).to.be.calledOnceWith(certificationCenter);
        expect(complementaryCertificationHabilitationRepository.deleteByCertificationCenterId).to.be.calledOnceWith(
          certificationCenter.id
        );
        expect(complementaryCertificationHabilitationRepository.save).to.be.calledWith(
          complementaryCertificationHabilitation1
        );
        expect(complementaryCertificationHabilitationRepository.save).to.be.calledWith(
          complementaryCertificationHabilitation2
        );
        expect(savedCertificationCenter).to.equal(certificationCenter);
      });
    });
  });
});
