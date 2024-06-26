import * as CertificationCenterForAdminRepository from '../../../../lib/infrastructure/repositories/certification-center-for-admin-repository.js';
import { CenterForAdmin } from '../../../../src/certification/enrolment/domain/models/CenterForAdmin.js';
import { databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';

describe('Integration | Repository | certification-center-for-admin', function () {
  let clock;
  const now = new Date('2021-11-16');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#save', function () {
    it('should save the given certification center', async function () {
      // given
      const certificationCenterId = 1;
      const certificationCenterName = 'CertificationCenterName';
      const certificationCenterType = 'SCO';
      const certificationCenterIsV3Pilot = true;

      const center = databaseBuilder.factory.buildCertificationCenter({
        id: certificationCenterId,
        name: certificationCenterName,
        type: certificationCenterType,
        isV3Pilot: certificationCenterIsV3Pilot,
      });

      const certificationCenterForAdmin = new CenterForAdmin({
        center,
      });

      // when
      const savedCertificationCenter = await CertificationCenterForAdminRepository.save(certificationCenterForAdmin);

      // then
      expect(savedCertificationCenter).to.be.instanceof(CenterForAdmin);
      expect(savedCertificationCenter.id).to.exist;
      expect(savedCertificationCenter.name).to.equal(certificationCenterName);
      expect(savedCertificationCenter.type).to.equal(certificationCenterType);
      expect(savedCertificationCenter.isV3Pilot).to.equal(certificationCenterIsV3Pilot);
    });
  });

  describe('#update', function () {
    let center;

    before(async function () {
      // given
      center = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.commit();
    });

    it('should update the given certification center', async function () {
      // when
      await CertificationCenterForAdminRepository.update({
        id: center.id,
        name: 'Great Oak Certification Center',
        updatedAt: now,
        isV3Pilot: true,
      });

      // then
      const updatedCertificationCenter = await knex('certification-centers').select().where({ id: center.id }).first();
      expect(updatedCertificationCenter).to.deep.equal({
        ...center,
        name: 'Great Oak Certification Center',
        updatedAt: updatedCertificationCenter.updatedAt,
        isV3Pilot: true,
      });
    });
  });
});
