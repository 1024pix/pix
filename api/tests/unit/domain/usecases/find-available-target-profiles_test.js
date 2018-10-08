const findAvailableTargetProfiles = require('../../../../lib/domain/usecases/find-available-target-profiles');
const { expect, sinon, factory } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

describe('Unit | UseCase | find-available-target-profiles', () => {

  let sandbox;
  const targetProfileRepository = {
    findPublicTargetProfiles: () => undefined,
    findTargetProfilesByOrganizationId: () => undefined,
  };
  const organizationRepository = {
    get: () => undefined,
  };
  let organizationId;
  let targetProfilesLinkedToOrganization;
  let targetProfileSharedWithOrganization;
  let publicTargetProfiles;

  beforeEach(() => {
    organizationId = 1;
    targetProfilesLinkedToOrganization = [factory.buildTargetProfile({ organizationId, isPublic: false })];
    targetProfileSharedWithOrganization = factory.buildTargetProfile({ isPublic: false });
    publicTargetProfiles = [factory.buildTargetProfile({ isPublic: true })];
    const targetProfileShared = [{
      targetProfile: targetProfileSharedWithOrganization
    }];
    const organization = factory.buildOrganization({ id: organizationId, targetProfileShared });

    sandbox = sinon.sandbox.create();
    targetProfileRepository.findPublicTargetProfiles = sandbox.stub().resolves(publicTargetProfiles);
    targetProfileRepository.findTargetProfilesByOrganizationId = sandbox.stub().resolves(targetProfilesLinkedToOrganization);
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

  it('should find public profiles and profiles linked or shared to/with anyOrganization', () => {
    // when
    const promise = findAvailableTargetProfiles({ organizationId, targetProfileRepository, organizationRepository });

    // then
    return promise.then(() => {
      expect(targetProfileRepository.findPublicTargetProfiles).to.have.been.calledOnce;
      expect(targetProfileRepository.findTargetProfilesByOrganizationId).to.have.been.calledOnce;
      expect(organizationRepository.get).to.have.been.calledOnce;
    });
  });

  it('should return public profiles and profiles linked to specified organization', () => {
    // when
    const promise = findAvailableTargetProfiles({ organizationId, targetProfileRepository, organizationRepository });

    // then
    return promise.then((availableTargetProfiles) => {
      expect(availableTargetProfiles.length).to.equal(3);
      expect(availableTargetProfiles).to.include.deep.members(targetProfilesLinkedToOrganization);
      expect(availableTargetProfiles).to.include(targetProfileSharedWithOrganization);
      expect(availableTargetProfiles).to.include.deep.members(publicTargetProfiles);
    });
  });

  it('should not have duplicate in targetProfiles', () => {
    // given
    targetProfileRepository.findPublicTargetProfiles.resolves(targetProfilesLinkedToOrganization);

    // when
    const promise = findAvailableTargetProfiles({ organizationId, targetProfileRepository, organizationRepository });

    // then
    return promise.then((availableTargetProfiles) => {
      expect(availableTargetProfiles.length).to.equal(2);
    });
  });

});
