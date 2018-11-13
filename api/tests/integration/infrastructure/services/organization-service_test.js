const _ = require('lodash');
const { expect, databaseBuilder } = require('../../../test-helper');
const organizationService = require('../../../../lib/domain/services/organization-service');

describe('Integration | Infrastructure | Services | organization-service', () => {
  describe('#findAllTargetProfilesAvailableForOrganization', () => {
    let organization;
    let sharedProfile;

    beforeEach(() => {
      organization = databaseBuilder.factory.buildOrganization();
      sharedProfile = databaseBuilder.factory.buildTargetProfile({
        isPublic: 0
      });
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId: organization.id,
        targetProfileId: sharedProfile.id,
      });

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should return an list of profile containing the shared profile', () => {
      const organizationId = organization.id;

      const promise = organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      return promise.then((profiles) => {
        const firstProfileWithoutCreatedAt = _.omit(profiles[0], 'createdAt');
        expect(firstProfileWithoutCreatedAt).to.deep.equal(sharedProfile);
      });
    });
  });
});
