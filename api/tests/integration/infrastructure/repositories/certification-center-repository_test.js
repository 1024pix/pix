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
        expect(certificationCenter.id).to.equal(1);
        expect(certificationCenter.name).to.equal('certificationCenterName');
        expect(certificationCenter.createdAt).to.deep.equal(new Date('2018-01-01T05:43:10Z'));
        expect(certificationCenter).to.have.all.keys(['id', 'name', 'externalId', 'createdAt']);
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

  describe('#find', () => {

    context('there are no certification centers', () => {

      it('should not return any result', async () => {
        // when
        const certificationCenters = await certificationCenterRepository.find();
        // then
        expect(certificationCenters).to.have.lengthOf(0);
      });

    });
    context('there are some certification centers', async () => {

      beforeEach(() => {
        _.times(5, databaseBuilder.factory.buildCertificationCenter);
        return databaseBuilder.commit();
      });

      it('should return all the certification centers', async () => {
        // when
        const certificationCenters = await certificationCenterRepository.find();
        // then
        expect(certificationCenters).to.have.lengthOf(5);
      });
    });
  });

});
