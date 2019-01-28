const { expect, knex, databaseBuilder } = require('../../../test-helper');
const certificationCenterMembershipRepository = require('../../../../lib/infrastructure/repositories/certification-center-membership-repository');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');

describe('Integration | Repository | Certification Center Membership', () => {

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('#create', () => {
    let user, certificationCenter;
    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser();
      certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.clean();
    });

    afterEach(() => {
      return knex('certification-center-memberships').delete();
    });

    it('should add a new membership in database', async () => {
      // given
      const beforeNbMemberships = await knex('certification-center-memberships').count('id as count');

      // when
      await certificationCenterMembershipRepository.create(user.id, certificationCenter.id);

      // then
      const afterNbMemberships = await knex('certification-center-memberships').count('id as count');
      expect(afterNbMemberships[0].count).to.equal(beforeNbMemberships[0].count + 1);
    });

    it('should return the certification center membership', async () => {
      // when
      const createdCertificationCenterMembership = await certificationCenterMembershipRepository.create(user.id, certificationCenter.id);

      // then
      expect(createdCertificationCenterMembership).to.be.an.instanceOf(CertificationCenterMembership);
      expect(createdCertificationCenterMembership.certificationCenter).to.be.an.instanceOf(CertificationCenter);
    });

    context('Error cases', () => {

      it('should throw an error when a membership already exist for user + certificationCenter', async () => {
        // given
        await certificationCenterMembershipRepository.create(user.id, certificationCenter.id);

        // when
        const promise = certificationCenterMembershipRepository.create(user.id, certificationCenter.id);

        // then
        return expect(promise).to.have.been.rejectedWith(Error);
      });

    });

  });

  describe('#findByUserId', () => {

    let userAsked, expectedCertificationCenter, expectedCertificationCenterMembership;
    beforeEach(async () => {
      userAsked = databaseBuilder.factory.buildUser();
      const otherUser = databaseBuilder.factory.buildUser();
      expectedCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const otherCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
      expectedCertificationCenterMembership = databaseBuilder.factory.buildCertificationCenterMembership({
        userId: userAsked.id,
        certificationCenterId: expectedCertificationCenter.id
      });
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: otherUser.id,
        certificationCenterId: otherCertificationCenter.id
      });
      await databaseBuilder.commit();
    });

    it('should return certification center membership associated to the user', () => {
      // when
      const promise = certificationCenterMembershipRepository.findByUserId(userAsked.id);

      // then
      return promise.then((certificationCenterMemberships) => {
        expect(certificationCenterMemberships).to.be.an('array');

        const certificationCenterMembership = certificationCenterMemberships[0];
        expect(certificationCenterMembership).to.be.an.instanceof(CertificationCenterMembership);
        expect(certificationCenterMembership.id).to.equal(expectedCertificationCenterMembership.id);

        const associatedCertificationCenter = certificationCenterMembership.certificationCenter;
        expect(associatedCertificationCenter).to.be.an.instanceof(CertificationCenter);
        expect(associatedCertificationCenter.id).to.equal(expectedCertificationCenter.id);
        expect(associatedCertificationCenter.name).to.equal(expectedCertificationCenter.name);
      });
    });
  });

});
