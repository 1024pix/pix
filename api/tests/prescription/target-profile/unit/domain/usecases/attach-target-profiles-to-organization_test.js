import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { attachTargetProfilesToOrganization } from '../../../../../../src/prescription/target-profile/domain/usecases/attach-target-profiles-to-organization.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | attach-target-profiles-to-organization', function () {
  let targetProfileRepository;
  let organizationsToAttachToTargetProfileRepository;
  const organizationId = 1;
  const targetProfileIds = [55, 66, 66];
  const uniqTargetProfileIds = [55, 66];

  beforeEach(function () {
    targetProfileRepository = {
      findByIds: sinon.stub(),
    };
    organizationsToAttachToTargetProfileRepository = {
      addTargetProfilesToOrganization: sinon.stub(),
    };
  });

  context('when unknown target profile ids are passed', function () {
    it('should throw a NotFound error', async function () {
      // given
      targetProfileRepository.findByIds.withArgs(uniqTargetProfileIds).resolves([]);
      organizationsToAttachToTargetProfileRepository.addTargetProfilesToOrganization.throws(
        new Error('I should not be called'),
      );

      // when
      const err = await catchErr(attachTargetProfilesToOrganization)({
        organizationId,
        targetProfileIds,
        targetProfileRepository,
        organizationsToAttachToTargetProfileRepository,
      });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal("Le(s) profil cible(s) [55, 66] n'existe(nt) pas.");
    });
  });

  context('when existing target profile ids are passed', function () {
    it('should call repository method to attach target profiles in a unique fashion', async function () {
      // given
      targetProfileRepository.findByIds
        .withArgs(uniqTargetProfileIds)
        .resolves([domainBuilder.buildTargetProfile({ id: 55 }), domainBuilder.buildTargetProfile({ id: 66 })]);
      organizationsToAttachToTargetProfileRepository.addTargetProfilesToOrganization.resolves();

      // when
      await attachTargetProfilesToOrganization({
        organizationId,
        targetProfileIds,
        targetProfileRepository,
        organizationsToAttachToTargetProfileRepository,
      });

      // then
      expect(
        organizationsToAttachToTargetProfileRepository.addTargetProfilesToOrganization,
      ).to.have.been.calledWithExactly({
        organizationId,
        targetProfileIdList: uniqTargetProfileIds,
      });
    });
  });
});
