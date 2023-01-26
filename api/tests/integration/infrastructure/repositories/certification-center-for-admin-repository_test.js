const { expect, databaseBuilder, domainBuilder, catchErr, sinon } = require('../../../test-helper');
const certificationCenterForAdminRepository = require('../../../../lib/infrastructure/repositories/certification-center-for-admin-repository');
const CertificationCenterForAdmin = require('../../../../lib/domain/models/CertificationCenterForAdmin');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | certification-center-for-admin', function () {
  let clock;
  const now = new Date('2021-11-16');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, shouldClearNativeTimers: true });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#get', function () {
    context('when the certification center is found', function () {
      it('should return the certification center of the given id with the right properties', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'certificationCenterName',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          type: CertificationCenterForAdmin.types.SUP,
          externalId: 'externalId',
          updatedAt: now,
        });
        databaseBuilder.factory.buildCertificationCenter({ id: 2 });
        const dataProtectionOfficer = databaseBuilder.factory.buildDataProtectionOfficer.withCertificationCenterId({
          firstName: 'Justin',
          lastName: 'Ptipeu',
          email: 'justin.ptipeu@example.net',
          certificationCenterId: 1,
        });

        const expectedCertificationCenter = domainBuilder.buildCertificationCenterForAdmin({
          id: 1,
          name: 'certificationCenterName',
          type: CertificationCenterForAdmin.types.SUP,
          externalId: 'externalId',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          complementaryCertifications: [],
          dataProtectionOfficerFirstName: dataProtectionOfficer.firstName,
          dataProtectionOfficerLastName: dataProtectionOfficer.lastName,
          dataProtectionOfficerEmail: dataProtectionOfficer.email,
          updatedAt: now,
        });

        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterForAdminRepository.get(1);

        // then
        expect(certificationCenter).to.deepEqualInstance(expectedCertificationCenter);
      });

      it('should return habilitations along with certification centers if there is any', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'certificationCenterName',
          type: CertificationCenterForAdmin.types.SUP,
          externalId: 'externalId',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        const dataProtectionOfficer = databaseBuilder.factory.buildDataProtectionOfficer.withCertificationCenterId({
          firstName: 'Justin',
          lastName: 'Ptipeu',
          email: 'justin.ptipeu@example.net',
          certificationCenterId: 1,
        });

        databaseBuilder.factory.buildComplementaryCertification({
          id: 12345,
          label: 'Complementary certification test 1',
          key: 'COMP_1',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 6789,
          label: 'Complementary certification test 2',
          key: 'COMP_2',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 1,
          complementaryCertificationId: 12345,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 1,
          complementaryCertificationId: 6789,
        });

        const expectedComplementaryCertification1 = domainBuilder.buildComplementaryCertification({
          id: 12345,
          label: 'Complementary certification test 1',
          key: 'COMP_1',
        });
        const expectedComplementaryCertification2 = domainBuilder.buildComplementaryCertification({
          id: 6789,
          label: 'Complementary certification test 2',
          key: 'COMP_2',
        });
        const expectedCertificationCenter = domainBuilder.buildCertificationCenterForAdmin({
          id: 1,
          name: 'certificationCenterName',
          type: CertificationCenterForAdmin.types.SUP,
          externalId: 'externalId',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          dataProtectionOfficerFirstName: dataProtectionOfficer.firstName,
          dataProtectionOfficerLastName: dataProtectionOfficer.lastName,
          dataProtectionOfficerEmail: dataProtectionOfficer.email,
          habilitations: [expectedComplementaryCertification2, expectedComplementaryCertification1],
          updatedAt: now,
        });

        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterForAdminRepository.get(1);

        expect(certificationCenter).to.deepEqualInstance(expectedCertificationCenter);
      });
    });

    context('the certification center could not be found', function () {
      it('should throw a NotFound error', async function () {
        // when
        const nonExistentId = 1;
        const error = await catchErr(certificationCenterForAdminRepository.get)(nonExistentId);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#save', function () {
    afterEach(async function () {
      await databaseBuilder.knex('certification-centers').delete();
    });

    it('should save the given certification center', async function () {
      // given
      const certificationCenter = new CertificationCenterForAdmin({
        name: 'CertificationCenterName',
        type: 'SCO',
      });

      // when
      const savedCertificationCenter = await certificationCenterForAdminRepository.save(certificationCenter);

      // then
      expect(savedCertificationCenter).to.be.instanceof(CertificationCenterForAdmin);
      expect(savedCertificationCenter.id).to.exist;
      expect(savedCertificationCenter.name).to.equal('CertificationCenterName');
      expect(savedCertificationCenter.type).to.equal('SCO');
    });
  });

  describe('#update', function () {
    let certificationCenter;

    before(async function () {
      // given
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.commit();
    });

    it('should update the given certification center', async function () {
      // when
      const updatedCertificationCenter = await certificationCenterForAdminRepository.update({
        id: certificationCenter.id,
        name: 'Great Oak Certification Center',
        updatedAt: now,
      });

      // then
      expect(updatedCertificationCenter).to.be.instanceof(CertificationCenterForAdmin);
      expect(updatedCertificationCenter).to.deep.equal(
        new CertificationCenterForAdmin({
          ...certificationCenter,
          name: 'Great Oak Certification Center',
          updatedAt: updatedCertificationCenter.updatedAt,
        })
      );
    });
  });
});
