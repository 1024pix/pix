const { expect, knex, databaseBuilder, domainBuilder, catchErr, sinon } = require('../../../test-helper');
const certificationCenterRepository = require('../../../../lib/infrastructure/repositories/certification-center-repository');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Repository | Certification Center', function () {
  let clock, now;

  beforeEach(function () {
    now = new Date('2021-11-16');
    clock = sinon.useFakeTimers(now);
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
        const certificationCenter = await certificationCenterRepository.get(1);

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
        const certificationCenter = await certificationCenterRepository.get(1);

        expect(certificationCenter).to.deepEqualInstance(expectedCertificationCenter);
      });
    });

    context('the certification center could not be found', function () {
      it('should throw a NotFound error', async function () {
        // when
        const nonExistentId = 1;
        const error = await catchErr(certificationCenterRepository.get)(nonExistentId);

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
        const certificationCenter = await certificationCenterRepository.getBySessionId(sessionId);

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
        const certificationCenter = await certificationCenterRepository.getBySessionId(sessionId);

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
        const error = await catchErr(certificationCenterRepository.getBySessionId)(8);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#save', function () {
    afterEach(function () {
      return knex('certification-centers').delete();
    });

    it('should save the given certification center', async function () {
      // given
      const certificationCenter = new CertificationCenter({
        name: 'CertificationCenterName',
        type: 'SCO',
      });

      // when
      const savedCertificationCenter = await certificationCenterRepository.save(certificationCenter);

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
      const savedCertificationCenter = await certificationCenterRepository.save(certificationCenter);

      // then
      expect(savedCertificationCenter.updatedAt).to.deep.equal(now);
    });
  });

  describe('#findPaginatedFiltered', function () {
    context('when there are CertificationCenters in the database', function () {
      it('should return an Array of CertificationCenters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'First certification center',
          externalId: '1',
          type: 'SUP',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        const expectedCertificationCenter1 = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'First certification center',
          type: CertificationCenter.types.SUP,
          externalId: '1',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Second certification center',
          externalId: '2',
          type: 'SCO',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        const expectedCertificationCenter2 = domainBuilder.buildCertificationCenter({
          id: 2,
          name: 'Second certification center',
          type: CertificationCenter.types.SCO,
          externalId: '2',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 3,
          name: 'Third certification center',
          externalId: '3',
          type: 'PRO',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          updatedAt: now,
        });
        const expectedCertificationCenter3 = domainBuilder.buildCertificationCenter({
          id: 3,
          name: 'Third certification center',
          type: CertificationCenter.types.PRO,
          externalId: '3',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
        });
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters.length).to.equal(3);
        expect(matchingCertificationCenters).to.deep.include.members([
          expectedCertificationCenter1,
          expectedCertificationCenter2,
          expectedCertificationCenter3,
        ]);
        expect(pagination).to.deep.equal(expectedPagination);
      });

      it('should return an Array of CertificationCenters and their habilitations', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 3,
          name: 'Third certification center',
          externalId: '3',
          type: 'PRO',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          updatedAt: now,
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 33,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 3,
          complementaryCertificationId: 33,
        });
        const expectedComplementaryCertification3 = domainBuilder.buildComplementaryCertification({
          id: 33,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        const expectedCertificationCenter3 = domainBuilder.buildCertificationCenter({
          id: 3,
          name: 'Third certification center',
          type: CertificationCenter.types.PRO,
          externalId: '3',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          habilitations: [expectedComplementaryCertification3],
          updatedAt: now,
        });

        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'First certification center',
          externalId: '1',
          type: 'SUP',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 11,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 1,
          complementaryCertificationId: 11,
        });
        const expectedComplementaryCertification1 = domainBuilder.buildComplementaryCertification({
          id: 11,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        const expectedCertificationCenter1 = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'First certification center',
          type: CertificationCenter.types.SUP,
          externalId: '1',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [expectedComplementaryCertification1],
          updatedAt: now,
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Second certification center',
          externalId: '2',
          type: 'SCO',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 22,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 2,
          complementaryCertificationId: 22,
        });
        const expectedComplementaryCertification2 = domainBuilder.buildComplementaryCertification({
          id: 22,
          label: 'Complementary certification name',
          key: 'COMP',
        });
        const expectedCertificationCenter2 = domainBuilder.buildCertificationCenter({
          id: 2,
          name: 'Second certification center',
          type: CertificationCenter.types.SCO,
          externalId: '2',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [expectedComplementaryCertification2],
          updatedAt: now,
        });

        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.deepEqualArray([
          expectedCertificationCenter1,
          expectedCertificationCenter2,
          expectedCertificationCenter3,
        ]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of CertificationCenters (> 10) in the database', function () {
      it('should return paginated matching CertificationCenters', async function () {
        // given
        _.times(12, databaseBuilder.factory.buildCertificationCenter);
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the same "name" search pattern', function () {
      it('should return only CertificationCenters matching "name" if given in filters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ name: 'Dragon & co center' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'Dragonades & co center' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'Broca & co center' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'Donnie & co center' });
        await databaseBuilder.commit();

        const filter = { name: 'dra' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.have.lengthOf(2);
        expect(_.map(matchingCertificationCenters, 'name')).to.have.members([
          'Dragon & co center',
          'Dragonades & co center',
        ]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the same "type" search pattern', function () {
      it('should return only CertificationCenters matching "type" if given in filters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ type: 'PRO' });
        databaseBuilder.factory.buildCertificationCenter({ type: 'PRO' });
        databaseBuilder.factory.buildCertificationCenter({ type: 'SUP' });
        databaseBuilder.factory.buildCertificationCenter({ type: 'SCO' });
        await databaseBuilder.commit();

        const filter = { type: 'S' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'type')).to.have.members(['SUP', 'SCO']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the same "externalId" search pattern', function () {
      it('should return only CertificationCenters matching "externalId" if given in filters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ externalId: 'AZH578' });
        databaseBuilder.factory.buildCertificationCenter({ externalId: 'BFR842' });
        databaseBuilder.factory.buildCertificationCenter({ externalId: 'AZH002' });
        await databaseBuilder.commit();

        const filter = { externalId: 'AZ' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'externalId')).to.have.members(['AZH578', 'AZH002']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context(
      'when there are multiple CertificationCenters matching the fields "first name", "last name" and "email" search pattern',
      function () {
        it('should return only CertificationCenters matching "name" AND "type" AND "externalId" if given in filters', async function () {
          // given
          _buildThreeCertificationCenterMatchingNameTypeAndExternalId({ databaseBuilder, numberOfBuild: 3 });
          _buildThreeCertificationCenterUnmatchingNameTypeOrExternalId({ databaseBuilder, numberOfBuild: 3 });
          await databaseBuilder.commit();

          const filter = { name: 'name_ok', type: 'SCO', externalId: 'c_ok' };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

          // when
          const { models: matchingCertificationCenters, pagination } =
            await certificationCenterRepository.findPaginatedFiltered({ filter, page });

          // then
          expect(_.map(matchingCertificationCenters, 'name')).to.have.members(['name_ok_1', 'name_ok_2', 'name_ok_3']);
          expect(_.map(matchingCertificationCenters, 'type')).to.have.members(['SCO', 'SCO', 'SCO']);
          expect(_.map(matchingCertificationCenters, 'externalId')).to.have.members(['c_ok_1', 'c_ok_2', 'c_ok_3']);
          expect(pagination).to.deep.equal(expectedPagination);
        });
      }
    );

    context('when there are filters that should be ignored', function () {
      it('should ignore the filters and retrieve all certificationCenters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ id: 1 });
        databaseBuilder.factory.buildCertificationCenter({ id: 2 });
        await databaseBuilder.commit();

        const filter = { foo: 1 };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'id')).to.have.members([1, 2]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
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
        const refererEmails = await certificationCenterRepository.getRefererEmails(certificationCenterId);

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
        const refererEmails = await certificationCenterRepository.getRefererEmails(certificationCenterId);

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

function _buildThreeCertificationCenterMatchingNameTypeAndExternalId({ databaseBuilder }) {
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_1', type: 'SCO', externalId: 'c_ok_1' });
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_2', type: 'SCO', externalId: 'c_ok_2' });
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_3', type: 'SCO', externalId: 'c_ok_3' });
}

function _buildThreeCertificationCenterUnmatchingNameTypeOrExternalId({ databaseBuilder }) {
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ko_4', type: 'SCO', externalId: 'c_ok_4' });
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_5', type: 'SUP', externalId: 'c_ok_5' });
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_6', type: 'SCO', externalId: 'c_ko_1' });
}
