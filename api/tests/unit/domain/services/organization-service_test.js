const { expect, sinon, domainBuilder } = require('../../../test-helper');

const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

const organizationService = require('../../../../lib/domain/services/organization-service');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');

describe('Unit | Service | OrganizationService', () => {

  describe('#generateUniqueOrganizationCode', () => {

    it('should exist', () => {
      expect(organizationService.generateUniqueOrganizationCode).to.exist.and.to.be.a('function');
    });

    it('should generate a random code with 4 letters and 2 numbers', () => {
      // given
      const organizationRepository = { isCodeAvailable: sinon.stub() };
      organizationRepository.isCodeAvailable.resolves(true);

      // when
      const promise = organizationService.generateUniqueOrganizationCode({ organizationRepository });

      // then
      return promise.then((code) => {
        expect(code).to.match(/[A-Z]{4}\d{2}/);
      });
    });

    it('should re-generate a code if the first ones already exist', () => {
      // given
      const organizationRepository = { isCodeAvailable: sinon.stub() };
      organizationRepository.isCodeAvailable
        .onFirstCall().rejects()
        .onSecondCall().resolves(true);

      // when
      const promise = organizationService.generateUniqueOrganizationCode({ organizationRepository });

      // then
      return promise.then(() => {
        expect(organizationRepository.isCodeAvailable).to.have.been.calledTwice;
      });
    });
  });

  describe('#findAllTargetProfilesAvailableForOrganization', () => {

    let organizationId;
    let targetProfilesOwnedByOrganization;
    let targetProfileSharesWithOrganization;
    let publicTargetProfiles;

    beforeEach(() => {
      organizationId = 1;
      targetProfilesOwnedByOrganization = [domainBuilder.buildTargetProfile({ organizationId, isPublic: false })];
      targetProfileSharesWithOrganization = domainBuilder.buildTargetProfile({ isPublic: false });
      publicTargetProfiles = [domainBuilder.buildTargetProfile({ isPublic: true })];
      const targetProfileShares = [{
        targetProfile: targetProfileSharesWithOrganization
      }];
      const organization = domainBuilder.buildOrganization({ id: organizationId, targetProfileShares });

      sinon.stub(targetProfileRepository, 'findPublicTargetProfiles').resolves(publicTargetProfiles);
      sinon.stub(targetProfileRepository, 'findTargetProfilesOwnedByOrganizationId').resolves(targetProfilesOwnedByOrganization);
      sinon.stub(organizationRepository, 'get').resolves(organization);
    });

    it('should return an array of target profiles', () => {
      // when
      const promise = organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      return promise.then((availableTargetProfiles) => {
        expect(availableTargetProfiles).to.be.an('array');
        expect(availableTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
      });
    });

    it('should return public profiles and profiles owned by or shared with anyOrganization', () => {
      // when
      const promise = organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      return promise.then((availableTargetProfiles) => {
        expect(availableTargetProfiles.length).to.equal(3);
        expect(availableTargetProfiles).to.include.deep.members(targetProfilesOwnedByOrganization);
        expect(availableTargetProfiles).to.include(targetProfileSharesWithOrganization);
        expect(availableTargetProfiles).to.include.deep.members(publicTargetProfiles);
      });
    });

    it('should not have duplicate in targetProfiles', () => {
      // given
      targetProfileRepository.findPublicTargetProfiles.resolves(targetProfilesOwnedByOrganization);

      // when
      const promise = organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      return promise.then((availableTargetProfiles) => {
        expect(availableTargetProfiles.length).to.equal(2);
      });
    });

    it('should return a list ordered by private profile before public profile and alphabetically', () => {
      // given
      targetProfilesOwnedByOrganization = [
        domainBuilder.buildTargetProfile({ name: 'C owned profile', organizationId, isPublic: false }),
        domainBuilder.buildTargetProfile({ name: 'A owned profile', organizationId, isPublic: false })
      ];
      targetProfileSharesWithOrganization = domainBuilder.buildTargetProfile({ name: 'B shared profile', isPublic: false });
      publicTargetProfiles = [
        domainBuilder.buildTargetProfile({ name: 'B Public profile', isPublic: true }),
        domainBuilder.buildTargetProfile({ name: 'A Public profile', isPublic: true })
      ];
      const targetProfileShares = [{
        targetProfile: targetProfileSharesWithOrganization
      }];
      const organization = domainBuilder.buildOrganization({ id: organizationId, targetProfileShares });

      targetProfileRepository.findPublicTargetProfiles.resolves(publicTargetProfiles);
      targetProfileRepository.findTargetProfilesOwnedByOrganizationId.resolves(targetProfilesOwnedByOrganization);
      organizationRepository.get.resolves(organization);
      // when
      const promise = organizationService.findAllTargetProfilesAvailableForOrganization(organizationId);

      // then
      return promise.then((availableTargetProfiles) => {
        expect(availableTargetProfiles.length).to.equal(5);
        expect(availableTargetProfiles[0].name).equal('A owned profile');
        expect(availableTargetProfiles[1].name).equal('B shared profile');
        expect(availableTargetProfiles[2].name).equal('C owned profile');
        expect(availableTargetProfiles[3].name).equal('A Public profile');
        expect(availableTargetProfiles[4].name).equal('B Public profile');

      });
    });
  });
});
