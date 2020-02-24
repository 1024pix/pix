const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { concat } = require('lodash');

const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

const organizationService = require('../../../../lib/domain/services/organization-service');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');

describe('Unit | Service | OrganizationService', () => {

  describe('#findAllTargetProfilesAvailableForOrganization', () => {

    let organizationId;
    let targetProfilesOwnedByOrganization;
    let targetProfileSharesWithOrganization;
    let targetProfileOrganizationCanUse;
    let publicTargetProfiles;

    beforeEach(() => {
      organizationId = 1;
      targetProfilesOwnedByOrganization = [domainBuilder.buildTargetProfile({ organizationId, isPublic: false })];
      targetProfileSharesWithOrganization = [domainBuilder.buildTargetProfile({ isPublic: false })];
      publicTargetProfiles = [domainBuilder.buildTargetProfile({ isPublic: true })];

      const targetProfileShares = [{
        targetProfile: targetProfileSharesWithOrganization
      }];

      const organization = domainBuilder.buildOrganization({ id: organizationId, targetProfileShares });
      targetProfileOrganizationCanUse = concat(publicTargetProfiles, targetProfilesOwnedByOrganization);

      sinon.stub(targetProfileRepository, 'findAllTargetProfilesOrganizationCanUse').resolves(targetProfileOrganizationCanUse);
      sinon.stub(organizationRepository, 'get').resolves(organization);
    });

    it('should return an array of type target profile', async () => {
      // when
      const availableTargetProfiles = await organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      expect(availableTargetProfiles).to.be.an('array');
      expect(availableTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
    });

    it('should return public profiles and profiles owned by or shared with anyOrganization', async () => {
      // when
      const availableTargetProfiles = await organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      expect(availableTargetProfiles.length).to.equal(3);
      expect(availableTargetProfiles).to.include.deep.members(targetProfilesOwnedByOrganization);
      expect(availableTargetProfiles).to.deep.include(targetProfileSharesWithOrganization);
      expect(availableTargetProfiles).to.include.deep.members(publicTargetProfiles);
    });

    it('should not have duplicate in targetProfiles', async () => {
      // given
      targetProfileRepository.findAllTargetProfilesOrganizationCanUse.resolves(targetProfilesOwnedByOrganization);

      // when
      const availableTargetProfiles = await organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      expect(availableTargetProfiles.length).to.equal(2);
    });

    it('should return a list ordered by private profile before public profile and alphabetically', async () => {
      // given
      const targetProfilesOwnedByOrganization = [
        domainBuilder.buildTargetProfile({ name: 'C owned profile', organizationId, isPublic: false }),
        domainBuilder.buildTargetProfile({ name: 'A owned profile', organizationId, isPublic: false })
      ];
      const targetProfileSharesWithOrganization = [
        domainBuilder.buildTargetProfile({ name: 'B shared profile', isPublic: false }),
        domainBuilder.buildTargetProfile({ name: 'W shared profile', isPublic: false })
      ];
      const publicTargetProfiles = [
        domainBuilder.buildTargetProfile({ name: 'B Public profile', isPublic: true }),
        domainBuilder.buildTargetProfile({ name: 'A Public profile', isPublic: true })
      ];
      const targetProfileShares = [{
        targetProfile: targetProfileSharesWithOrganization
      }];
      const organization = domainBuilder.buildOrganization({ id: organizationId, targetProfileShares });

      targetProfileOrganizationCanUse = concat(targetProfilesOwnedByOrganization, publicTargetProfiles);

      targetProfileRepository.findAllTargetProfilesOrganizationCanUse.resolves(targetProfileOrganizationCanUse);
      organizationRepository.get.resolves(organization);
      // when
      const availableTargetProfiles = await organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      expect(availableTargetProfiles.length).to.equal(5);
      expect(availableTargetProfiles[0].name).equal('A owned profile');
      expect(availableTargetProfiles[1].name).equal('C owned profile');
      expect(availableTargetProfiles[2].name).equal('A Public profile');
      expect(availableTargetProfiles[3].name).equal('B Public profile');
      expect(availableTargetProfiles[4][0].name).equal('B shared profile');
      expect(availableTargetProfiles[4][1].name).equal('W shared profile');
    });

    it('should exclude targetProfileShares witch are outdated', async () => {
      // given
      const targetProfiles = [
        domainBuilder.buildTargetProfile({ organizationId }),
      ];
      const targetProfileSharesWithOrganization = [
        domainBuilder.buildTargetProfile({ isPublic: false, outdated: true }),
        domainBuilder.buildTargetProfile({ isPublic: false, outdated: false })
      ];
      const targetProfileShares = [{
        targetProfile: targetProfileSharesWithOrganization
      }];
      const organization = domainBuilder.buildOrganization({ id: organizationId, targetProfileShares });

      targetProfileRepository.findAllTargetProfilesOrganizationCanUse.resolves(targetProfiles);
      organizationRepository.get.resolves(organization);

      // when
      const availableTargetProfiles = await organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      expect(availableTargetProfiles.length).to.equal(2);
    });
  });
});
