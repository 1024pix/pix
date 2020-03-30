const { expect, sinon, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');

const attachTargetProfilesToOrganization = require('../../../../lib/domain/usecases/attach-target-profiles-to-organization');

describe('Unit | UseCase | attach-target-profiles-to-organization', () => {

  let targetProfileShareRepository;
  let targetProfileRepository;
  let targetProfileIdsToAttach;
  const organizationId = 1;
  const expectedResult = Symbol('success');

  beforeEach(() => {
    targetProfileRepository = {
      findByIds: sinon.stub(),
    };
    targetProfileShareRepository = {
      addTargetProfilesToOrganization: sinon.stub(),
    };
  });

  it('should call repository with organizationId and targetProfileIdsToAttach', async () => {
    // given
    targetProfileIdsToAttach = [1];
    targetProfileRepository.findByIds.withArgs(targetProfileIdsToAttach).resolves([{ id: 1 }]);
    targetProfileShareRepository.addTargetProfilesToOrganization.withArgs({ organizationId, targetProfileIdList: targetProfileIdsToAttach }).resolves(expectedResult);

    // when
    const result = await attachTargetProfilesToOrganization({ targetProfileShareRepository, targetProfileRepository, organizationId, targetProfileIdsToAttach });

    // then
    expect(result).to.equal(expectedResult);
  });

  it('should delete duplicated targetProfileId', async () => {
    // given
    targetProfileIdsToAttach = [1, 2, 2];
    const cleanedTargetProfileIdsToAttach = [1, 2];
    targetProfileRepository.findByIds.withArgs(cleanedTargetProfileIdsToAttach).resolves([{ id: 1 }, { id: 2 }]);
    targetProfileShareRepository.addTargetProfilesToOrganization.withArgs({ organizationId, targetProfileIdList: cleanedTargetProfileIdsToAttach }).resolves(expectedResult);

    // when
    const result = await attachTargetProfilesToOrganization({ targetProfileShareRepository, targetProfileRepository, organizationId, targetProfileIdsToAttach });

    // then
    expect(result).to.equal(expectedResult);
  });

  it('should throw a NotFoundError when a target profile does not exist', async () => {
    // given
    targetProfileIdsToAttach = [1, 2];
    targetProfileRepository.findByIds.withArgs(targetProfileIdsToAttach).resolves([{ id: 2 }]);

    // when
    const error = await catchErr(attachTargetProfilesToOrganization)({ targetProfileShareRepository, targetProfileRepository, organizationId, targetProfileIdsToAttach });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
    expect(error.message).to.equal('Le profil cible 1 n\'existe pas.');
  });
});
