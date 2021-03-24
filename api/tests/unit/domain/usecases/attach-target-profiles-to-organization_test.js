const { expect, sinon, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');

const attachTargetProfilesToOrganization = require('../../../../lib/domain/usecases/attach-target-profiles-to-organization');
const { ConflictError } = require('../../../../lib/application/http-errors');

describe('Unit | UseCase | attach-target-profiles-to-organization', function() {

  let organizationRepository;
  let targetProfileShareRepository;
  let targetProfileRepository;
  let targetProfileIdsToAttach;
  const organizationId = 1;
  const expectedResult = Symbol('success');

  beforeEach(function() {
    organizationRepository = {
      get: sinon.stub(),
    };
    targetProfileRepository = {
      findByIds: sinon.stub(),
    };
    targetProfileShareRepository = {
      addTargetProfilesToOrganization: sinon.stub(),
    };
  });

  it('should call repository with organizationId and targetProfileIdsToAttach', async function() {
    // given
    targetProfileIdsToAttach = [1];
    targetProfileRepository.findByIds.withArgs(targetProfileIdsToAttach).resolves([{ id: 1 }]);
    organizationRepository.get.withArgs(organizationId).resolves({ targetProfileShares: [] });

    targetProfileShareRepository.addTargetProfilesToOrganization.withArgs({ organizationId, targetProfileIdList: targetProfileIdsToAttach }).resolves(expectedResult);

    // when
    const result = await attachTargetProfilesToOrganization({ targetProfileShareRepository, targetProfileRepository, organizationRepository, organizationId, targetProfileIdsToAttach });

    // then
    expect(result).to.equal(expectedResult);
  });

  it('should call repository with organizationId and targetProfileIdsToAttach even one target profile already linked', async function() {
    // given
    targetProfileIdsToAttach = [1, 2];
    targetProfileRepository.findByIds.withArgs(targetProfileIdsToAttach).resolves([{ id: 1 }, { id: 2 }]);

    organizationRepository.get.withArgs(organizationId).resolves({ targetProfileShares: [{ targetProfileId: 1 }] });

    targetProfileShareRepository.addTargetProfilesToOrganization.withArgs({ organizationId, targetProfileIdList: [2] }).resolves(expectedResult);

    // when
    const result = await attachTargetProfilesToOrganization({ targetProfileShareRepository, targetProfileRepository, organizationRepository, organizationId, targetProfileIdsToAttach });

    // then
    expect(result).to.equal(expectedResult);
  });

  it('should delete duplicated targetProfileId', async function() {
    // given
    targetProfileIdsToAttach = [1, 2, 2];
    const cleanedTargetProfileIdsToAttach = [1, 2];
    targetProfileRepository.findByIds.withArgs(cleanedTargetProfileIdsToAttach).resolves([{ id: 1 }, { id: 2 }]);
    organizationRepository.get.withArgs(organizationId).resolves({ targetProfileShares: [] });

    targetProfileShareRepository.addTargetProfilesToOrganization.withArgs({ organizationId, targetProfileIdList: cleanedTargetProfileIdsToAttach }).resolves(expectedResult);

    // when
    const result = await attachTargetProfilesToOrganization({ targetProfileShareRepository, targetProfileRepository, organizationRepository, organizationId, targetProfileIdsToAttach });

    // then
    expect(result).to.equal(expectedResult);
  });

  it('should throw a NotFoundError when a target profile does not exist', async function() {
    // given
    targetProfileIdsToAttach = [1, 2];
    targetProfileRepository.findByIds.withArgs(targetProfileIdsToAttach).resolves([{ id: 2 }]);
    organizationRepository.get.withArgs(organizationId).resolves({ targetProfileShares: [] });

    // when
    const error = await catchErr(attachTargetProfilesToOrganization)({ targetProfileShareRepository, targetProfileRepository, organizationRepository, organizationId, targetProfileIdsToAttach });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
    expect(error.message).to.equal('Le profil cible 1 n\'existe pas.');
  });

  it('should throw a NotFoundError when a target profile already attached to organization', async function() {
    // given
    targetProfileIdsToAttach = [1];
    targetProfileRepository.findByIds.withArgs(targetProfileIdsToAttach).resolves([{ id: 1 }]);

    organizationRepository.get.withArgs(organizationId).resolves({ targetProfileShares: [{ targetProfileId: 1 }] });

    // when
    const error = await catchErr(attachTargetProfilesToOrganization)({ targetProfileShareRepository, targetProfileRepository, organizationRepository, organizationId, targetProfileIdsToAttach });

    // then
    expect(error).to.be.instanceOf(ConflictError);
    expect(error.message).to.equal('Profil(s) cible(s) déjà rattaché.');
  });
});
