const { expect, knex, databaseBuilder } = require('../../../test-helper');
const certificationCenterMembershipRepository = require('../../../../lib/infrastructure/repositories/certification-center-membership-repository');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const { CertificationCenterMembershipCreationError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Certification Center Membership', () => {

  let user, certificationCenter;
  beforeEach(async () => {
    user = databaseBuilder.factory.buildUser();
    certificationCenter = databaseBuilder.factory.buildUser();
    await databaseBuilder.clean();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('#create', () => {
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
      expect(createdCertificationCenterMembership.certificationCenter.id).to.equal(certificationCenter.id);
    });

    context('Error cases', () => {

      it('should throw a domain error when a membership already exist for user + certificationCenter', async () => {
        // given
        await certificationCenterMembershipRepository.create(user.id, certificationCenter.id);

        // when
        const promise = certificationCenterMembershipRepository.create(user.id, certificationCenter.id);

        // then
        return expect(promise).to.have.been.rejectedWith(CertificationCenterMembershipCreationError);
      });

    });

  });

});
