const usecases = require('../../../../lib/domain/usecases');
const { expect, sinon, factory } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');

describe('Unit | UseCase | find-available-target-profiles', () => {

  let sandbox;
  const targetProfileRepository = {
    findPublicTargetProfiles: () => undefined,
    findTargetProfilesByOrganizationId: () => undefined,
  };
  let organizationId;
  let targetProfilesLinkedToOrganization;
  let publicTargetProfiles;

  beforeEach(() => {
    organizationId = 1;
    targetProfilesLinkedToOrganization = [factory.buildTargetProfile({ organizationId })];
    publicTargetProfiles = [factory.buildTargetProfile({ isPublic: true })];

    sandbox = sinon.sandbox.create();
    targetProfileRepository.findPublicTargetProfiles = sandbox.stub().resolves(publicTargetProfiles);
    targetProfileRepository.findTargetProfilesByOrganizationId = sandbox.stub().resolves(targetProfilesLinkedToOrganization);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return an array of target profiles', () => {
    // when
    const promise = usecases.findAvailableTargetProfiles({ organizationId, targetProfileRepository });

    // then
    return promise.then((availableTargetProfiles) => {
      expect(availableTargetProfiles).to.be.an('array');
      expect(availableTargetProfiles[0]).to.be.an.instanceOf(TargetProfile);
    });
  });

  it('should find public profiles and profiles linked to anyOrganization', () => {
    // when
    const promise = usecases.findAvailableTargetProfiles({ organizationId, targetProfileRepository });

    // then
    return promise.then(() => {
      expect(targetProfileRepository.findPublicTargetProfiles).to.have.been.calledOnce;
      expect(targetProfileRepository.findTargetProfilesByOrganizationId).to.have.been.calledOnce;
    });
  });

  it('should return public profiles and profiles linked to specified organization', () => {
    // when
    const promise = usecases.findAvailableTargetProfiles({ organizationId, targetProfileRepository });

    // then
    return promise.then((availableTargetProfiles) => {
      expect(availableTargetProfiles.length).to.equal(2);
      expect(availableTargetProfiles).to.include.deep.members(targetProfilesLinkedToOrganization);
      expect(availableTargetProfiles).to.include.deep.members(publicTargetProfiles);
    });
  });

});
