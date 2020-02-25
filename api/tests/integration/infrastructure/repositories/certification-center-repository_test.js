const { expect, knex, databaseBuilder } = require('../../../test-helper');
const certificationCenterRepository = require('../../../../lib/infrastructure/repositories/certification-center-repository');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Repository | Certification Center', () => {

  describe('#get', () => {

    context('the certification is found', () => {

      beforeEach(async () => {
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'certificationCenterName',
          createdAt: new Date('2018-01-01T05:43:10Z'),
        });
        databaseBuilder.factory.buildCertificationCenter({ id: 2 });

        await databaseBuilder.commit();
      });

      it('should return the certification of the given id with the right properties', async () => {
        // when
        const certificationCenter = await certificationCenterRepository.get(1);

        // then
        expect(certificationCenter).to.be.an.instanceOf(CertificationCenter);
        expect(certificationCenter.id).to.equal(1);
        expect(certificationCenter.name).to.equal('certificationCenterName');
        expect(certificationCenter.createdAt).to.deep.equal(new Date('2018-01-01T05:43:10Z'));
        expect(certificationCenter).to.have.all.keys(['id', 'name', 'type', 'externalId', 'createdAt']);
      });
    });

    context('the certification center could not be found', () => {

      it('should throw a NotFound error', () => {
        // when
        const nonExistentId = 1;
        const promise = certificationCenterRepository.get(nonExistentId);
        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError);
      });
    });
  });

  describe('#save', () => {

    afterEach(() => {
      return knex('certification-centers').delete();
    });

    it('should save the given certification center', async () => {
      // given
      const certificationCenter = new CertificationCenter({ name: 'CertificationCenterName' });
      // when
      const savedCertificationCenter = await certificationCenterRepository.save(certificationCenter);
      // then
      expect(savedCertificationCenter).to.be.instanceof(CertificationCenter);
      expect(savedCertificationCenter.id).to.exist;
      expect(savedCertificationCenter.name).to.equal(certificationCenter.name);
    });
  });

  describe('#findPaginatedFiltered', () => {

    context('when there are CertificationCenters in the database', () => {

      beforeEach(() => {
        _.times(3, databaseBuilder.factory.buildCertificationCenter);

        return databaseBuilder.commit();
      });

      it('should return an Array of CertificationCenters', async () => {
        // given
        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingCertificationCenters, pagination } = await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.exist;
        expect(matchingCertificationCenters).to.have.lengthOf(3);
        expect(matchingCertificationCenters[0]).to.be.an.instanceOf(CertificationCenter);
        expect(pagination).to.deep.equal(expectedPagination);
      });

    });

    context('when there are lots of CertificationCenters (> 10) in the database', () => {

      beforeEach(() => {
        _.times(12, databaseBuilder.factory.buildCertificationCenter);
        return databaseBuilder.commit();
      });

      it('should return paginated matching CertificationCenters', async () => {
        // given
        const filter = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingCertificationCenters, pagination } = await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the same "name" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildCertificationCenter({ name: 'Dragon & co center' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'Dragonades & co center' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'Broca & co center' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'Donnie & co center' });
        return databaseBuilder.commit();
      });

      it('should return only CertificationCenters matching "name" if given in filters', async () => {
        // given
        const filter = { name: 'dra' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } = await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.have.lengthOf(2);
        expect(_.map(matchingCertificationCenters, 'name')).to.have.members(['Dragon & co center', 'Dragonades & co center']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the same "type" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildCertificationCenter({ type: 'PRO' });
        databaseBuilder.factory.buildCertificationCenter({ type: 'PRO' });
        databaseBuilder.factory.buildCertificationCenter({ type: 'SUP' });
        databaseBuilder.factory.buildCertificationCenter({ type: 'SCO' });
        return databaseBuilder.commit();
      });

      it('should return only CertificationCenters matching "type" if given in filters', async () => {
        // given
        const filter = { type: 'S' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } = await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'type')).to.have.members(['SUP', 'SCO']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the same "externalId" search pattern', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildCertificationCenter({ externalId: 'AZH578' });
        databaseBuilder.factory.buildCertificationCenter({ externalId: 'BFR842' });
        databaseBuilder.factory.buildCertificationCenter({ externalId: 'AZH002' });
        return databaseBuilder.commit();
      });

      it('should return only CertificationCenters matching "externalId" if given in filters', async () => {
        // given
        const filter = { externalId: 'AZ' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } = await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'externalId')).to.have.members(['AZH578', 'AZH002']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the fields "first name", "last name" and "email" search pattern', () => {

      beforeEach(() => {
        // Matching users
        databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_1', type: 'SCO', externalId: 'c_ok_1' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_2', type: 'SCO', externalId: 'c_ok_2' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_3', type: 'SCO', externalId: 'c_ok_3' });

        // Unmatching users
        databaseBuilder.factory.buildCertificationCenter({ name: 'name_ko_4', type: 'SCO', externalId: 'c_ok_4' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_5', type: 'SUP', externalId: 'c_ok_5' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_6', type: 'SCO', externalId: 'c_ko_1' });

        return databaseBuilder.commit();
      });

      it('should return only CertificationCenters matching "name" AND "type" AND "externalId" if given in filters', async () => {
        // given
        const filter = { name: 'name_ok', type: 'SCO', externalId: 'c_ok' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingCertificationCenters, pagination } = await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'name')).to.have.members(['name_ok_1', 'name_ok_2', 'name_ok_3']);
        expect(_.map(matchingCertificationCenters, 'type')).to.have.members(['SCO', 'SCO', 'SCO']);
        expect(_.map(matchingCertificationCenters, 'externalId')).to.have.members(['c_ok_1', 'c_ok_2', 'c_ok_3']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are filters that should be ignored', () => {

      beforeEach(() => {
        databaseBuilder.factory.buildCertificationCenter({ id: 1 });
        databaseBuilder.factory.buildCertificationCenter({ id: 2 });

        return databaseBuilder.commit();
      });

      it('should ignore the filters and retrieve all certificationCenters', async () => {
        // given
        const filter = { foo: 1 };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } = await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'id')).to.have.members([1, 2]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
  });
});
