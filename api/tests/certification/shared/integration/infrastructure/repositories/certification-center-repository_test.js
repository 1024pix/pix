import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { CertificationCenter } from '../../../../../../lib/domain/models/CertificationCenter.js';
import * as certificationCenterRepository from '../../../../../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import { catchErr, databaseBuilder, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Integration | Repository | Certification Center', function () {
  let clock, now;

  beforeEach(function () {
    now = new Date('2021-11-16');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
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
          type: CertificationCenter.types.SUP,
          externalId: 'externalId',
          updatedAt: now,
        });
        databaseBuilder.factory.buildCertificationCenter({ id: 2 });

        const expectedCertificationCenter = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'certificationCenterName',
          type: CertificationCenter.types.SUP,
          externalId: 'externalId',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          complementaryCertifications: [],
          updatedAt: now,
        });

        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterRepository.get({ id: 1 });

        // then
        expect(certificationCenter).to.deepEqualInstance(expectedCertificationCenter);
      });

      it('should return habilitations along with certification centers if there is any', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'certificationCenterName',
          type: CertificationCenter.types.SUP,
          externalId: 'externalId',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
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
        const expectedCertificationCenter = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'certificationCenterName',
          type: CertificationCenter.types.SUP,
          externalId: 'externalId',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [expectedComplementaryCertification2, expectedComplementaryCertification1],
          updatedAt: now,
        });

        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterRepository.get({ id: 1 });

        expect(certificationCenter).to.deepEqualInstance(expectedCertificationCenter);
      });
    });

    context('when the certification center could not be found', function () {
      it('should throw a NotFound error', async function () {
        // when
        const nonExistentId = 1;
        const error = await catchErr(certificationCenterRepository.get)({ id: nonExistentId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#getBySessionId', function () {
    context('the certification center is found for a sessionId', function () {
      it('should return the certification center of the given sessionId', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'Given session center',
          externalId: '123456',
          type: 'SCO',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        }).id;
        const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
        const expectedCertificationCenter = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'Given session center',
          type: 'SCO',
          externalId: '123456',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
        });

        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

        // then
        expect(certificationCenter).to.deepEqualInstance(expectedCertificationCenter);
      });

      it('should return the certification center and habilitations of the given sessionId', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'certificationCenterName',
          type: CertificationCenter.types.SUP,
          externalId: 'externalId',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        }).id;
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1234,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 1,
          complementaryCertificationId: 1234,
        });

        const expectedComplementaryCertification = domainBuilder.buildComplementaryCertification({
          id: 1234,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        const expectedCertificationCenter = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'certificationCenterName',
          type: CertificationCenter.types.SUP,
          externalId: 'externalId',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [expectedComplementaryCertification],
          updatedAt: now,
        });
        const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

        expect(certificationCenter).to.deepEqualInstance(expectedCertificationCenter);
      });
    });

    context('the certification center could not be found for a sessionId', function () {
      it('should throw a NotFound error', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 7,
          name: 'certificationCenterName',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          externalId: '123456',
          type: 'SCO',
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(certificationCenterRepository.getBySessionId)({ sessionId: 8 });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#save', function () {
    it('should save the given certification center', async function () {
      // given
      const certificationCenter = new CertificationCenter({
        name: 'CertificationCenterName',
        type: 'SCO',
      });

      // when
      const savedCertificationCenter = await certificationCenterRepository.save({ certificationCenter });

      // then
      expect(savedCertificationCenter).to.be.instanceof(CertificationCenter);
      expect(savedCertificationCenter.id).to.exist;
      expect(savedCertificationCenter.name).to.equal('CertificationCenterName');
      expect(savedCertificationCenter.type).to.equal('SCO');
    });

    it('should update the given certification center with the proper updated date', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        name: 'CertificationCenterName',
        type: 'SCO',
      });
      await databaseBuilder.commit();

      // when
      const savedCertificationCenter = await certificationCenterRepository.save({ certificationCenter });

      // then
      expect(savedCertificationCenter.updatedAt).to.deep.equal(now);
    });
  });

  describe('#findByExternalId', function () {
    context('the certification center is found', function () {
      it('should return the certification center', async function () {
        // given
        const externalId = 'EXTERNAL_ID';
        databaseBuilder.factory.buildCertificationCenter({
          externalId,
          id: 1,
          name: 'Certif center to return by external Id',
          type: 'SUP',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        const expectedCertificationCenter = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'Certif center to return by external Id',
          type: CertificationCenter.types.SUP,
          externalId: 'EXTERNAL_ID',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterRepository.findByExternalId({ externalId });

        // then
        expect(certificationCenter).to.deepEqualInstance(expectedCertificationCenter);
      });

      it('should return the certification center and habilitations', async function () {
        // given
        const externalId = 'EXTERNAL_ID';
        databaseBuilder.factory.buildCertificationCenter({
          externalId,
          id: 1,
          name: 'Certif center to return by external Id',
          type: 'SUP',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 123,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 1,
          complementaryCertificationId: 123,
        });
        const expectedComplementaryCertification = domainBuilder.buildComplementaryCertification({
          id: 123,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        const expectedCertificationCenter = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'Certif center to return by external Id',
          type: CertificationCenter.types.SUP,
          externalId: 'EXTERNAL_ID',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [expectedComplementaryCertification],
          updatedAt: now,
        });

        await databaseBuilder.commit();

        // when
        const certificationCenter = await certificationCenterRepository.findByExternalId({ externalId });

        // then
        expect(certificationCenter).to.deepEqualInstance(expectedCertificationCenter);
      });
    });

    context('the certification center is not found', function () {
      it('should return null', async function () {
        // when
        const externalId = 'nonExistentExternalId';
        const certificationCenter = await certificationCenterRepository.findByExternalId({ externalId });

        // then
        expect(certificationCenter).to.be.null;
      });
    });
  });

  describe('#getRefererEmails', function () {
    context('when the certification center has no referer', function () {
      it('should return an empty array', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ certificationCenterId, userId, isReferer: false });
        await databaseBuilder.commit();

        // when
        const refererEmails = await certificationCenterRepository.getRefererEmails({ id: certificationCenterId });

        // then
        expect(refererEmails).to.be.empty;
      });
    });

    context('when the certification center has at least one referer', function () {
      it('should return an array of referer emails', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId: databaseBuilder.factory.buildUser().id,
          certificationCenterId: databaseBuilder.factory.buildCertificationCenter().id,
          isReferer: true,
        });
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const user1 = databaseBuilder.factory.buildUser({ email: 'toto@example.net' });
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId,
          userId: user1.id,
          isReferer: true,
        });
        const user2 = databaseBuilder.factory.buildUser({ email: 'tutu@example.net' });
        databaseBuilder.factory.buildCertificationCenterMembership({
          certificationCenterId,
          userId: user2.id,
          isReferer: true,
        });
        await databaseBuilder.commit();

        // when
        const refererEmails = await certificationCenterRepository.getRefererEmails({ id: certificationCenterId });

        // then
        expect(refererEmails).to.deepEqualArray([
          {
            email: 'toto@example.net',
          },
          {
            email: 'tutu@example.net',
          },
        ]);
      });
    });
  });
});
