const findAvailableTargetProfiles = require('../../../../lib/domain/usecases/find-available-target-profiles');
const { expect, sinon, factory } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

describe('Unit | UseCase | find-available-target-profiles', () => {

  let sandbox;
  const targetProfileRepository = {
    findPublicTargetProfiles: () => undefined,
    findTargetProfilesOwnedByOrganizationId: () => undefined,
  };
  const organizationRepository = {
    get: () => undefined,
  };
  let organizationId;
  let targetProfilesOwnedByOrganization;
  let targetProfileSharesWithOrganization;
  let publicTargetProfiles;

  beforeEach(() => {
    organizationId = 1;
    targetProfilesOwnedByOrganization = [factory.buildTargetProfile({ organizationId, isPublic: false })];
    targetProfileSharesWithOrganization = factory.buildTargetProfile({ isPublic: false });
    publicTargetProfiles = [factory.buildTargetProfile({ isPublic: true })];
    const targetProfileShares = [{
      targetProfile: targetProfileSharesWithOrganization
    }];
    const organization = factory.buildOrganization({ id: organizationId, targetProfileShares });

    sandbox = sinon.sandbox.create();
    targetProfileRepository.findPublicTargetProfiles = sandbox.stub().resolves(publicTargetProfiles);
    targetProfileRepository.findTargetProfilesOwnedByOrganizationId = sandbox.stub().resolves(targetProfilesOwnedByOrganization);
    organizationRepository.get = sandbox.stub().resolves(organization);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return an array of target profiles', () => {
    // when
    const promise = findAvailableTargetProfiles({ organizationId, targetProfileRepository, organizationRepository });

    // then
    return promise.then((availableTargetProfiles) => {
      expect(availableTargetProfiles).to.be.an('array');
      expect(availableTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
    });
  });

  it('should return public profiles and profiles owned by or shared with anyOrganization', () => {
    // when
    const promise = findAvailableTargetProfiles({ organizationId, targetProfileRepository, organizationRepository });

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
    const promise = findAvailableTargetProfiles({ organizationId, targetProfileRepository, organizationRepository });

    // then
    return promise.then((availableTargetProfiles) => {
      expect(availableTargetProfiles.length).to.equal(2);
    });
  });

});
