import { expect, domainBuilder, sinon } from '../../../test-helper';
import createCertificationCenter from '../../../../lib/domain/usecases/create-certification-center';
import DataProtectionOfficer from '../../../../lib/domain/models/DataProtectionOfficer';

describe('Unit | UseCase | create-certification-center', function () {
  describe('#createCertificationCenter', function () {
    it('should save and return the certification center', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const certificationCenterForAdminRepository = { save: sinon.stub().returns(certificationCenter) };
      const complementaryCertificationHabilitationRepository = {};
      const dataProtectionOfficerRepository = {
        create: sinon.stub().resolves(
          new DataProtectionOfficer({
            id: 1,
            certificationCenterId: certificationCenter.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
          })
        ),
      };

      // when
      const createdCertificationCenter = await createCertificationCenter({
        certificationCenter,
        complementaryCertificationIds: [],
        certificationCenterForAdminRepository,
        complementaryCertificationHabilitationRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(certificationCenterForAdminRepository.save).to.be.calledOnceWith(certificationCenter);
      expect(createdCertificationCenter).to.deepEqualInstance(certificationCenter);
    });

    it('should save the complementary certification habilitations', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const complementaryCertificationIds = ['1234', '4567'];
      const certificationCenterForAdminRepository = { save: sinon.stub().returns(certificationCenter) };
      const complementaryCertificationHabilitationRepository = {
        save: sinon.stub(),
      };
      const dataProtectionOfficerRepository = {
        create: sinon.stub().resolves(
          new DataProtectionOfficer({
            id: 1,
            certificationCenterId: certificationCenter.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
          })
        ),
      };

      // when
      await createCertificationCenter({
        certificationCenter,
        complementaryCertificationIds,
        certificationCenterForAdminRepository,
        complementaryCertificationHabilitationRepository,
        dataProtectionOfficerRepository,
      });

      // then
      expect(complementaryCertificationHabilitationRepository.save).to.be.calledTwice;
    });

    it('should create a data protection officer while saving and returning the certification center', async function () {
      // given
      const certificationCenter = domainBuilder.buildCertificationCenter();
      const dataProtectionOfficer = {
        certificationCenterId: certificationCenter.id,
        firstName: 'Justin',
        lastName: 'Ptipeu',
        email: 'justin.ptipeu@example.net',
      };
      certificationCenter.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
      certificationCenter.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
      certificationCenter.dataProtectionOfficerEmail = dataProtectionOfficer.email;
      const certificationCenterForAdminRepository = { save: sinon.stub().returns(certificationCenter) };
      const dataProtectionOfficerRepository = {
        create: sinon.stub().resolves(
          new DataProtectionOfficer({
            id: 1,
            certificationCenterId: certificationCenter.id,
            firstName: 'Justin',
            lastName: 'Ptipeu',
            email: 'justin.ptipeu@example.net',
          })
        ),
      };
      const complementaryCertificationHabilitationRepository = {};

      // when
      await createCertificationCenter({
        certificationCenter,
        complementaryCertificationIds: [],
        certificationCenterForAdminRepository,
        dataProtectionOfficerRepository,
        complementaryCertificationHabilitationRepository,
      });

      // then
      expect(dataProtectionOfficerRepository.create).to.be.calledOnceWith(dataProtectionOfficer);
    });
  });
});
