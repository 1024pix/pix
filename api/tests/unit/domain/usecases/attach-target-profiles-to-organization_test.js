import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper';
import { NotFoundError } from '../../../../lib/domain/errors';
import attachTargetProfilesToOrganization from '../../../../lib/domain/usecases/attach-target-profiles-to-organization';

describe('Unit | UseCase | attach-target-profiles-to-organization', function () {
  let targetProfileRepository;
  let targetProfileShareRepository;
  const organizationId = 1;
  const targetProfileIds = [55, 66, 66];
  const uniqTargetProfileIds = [55, 66];

  beforeEach(function () {
    targetProfileRepository = {
      findByIds: sinon.stub(),
    };
    targetProfileShareRepository = {
      addTargetProfilesToOrganization: sinon.stub(),
    };
  });

  context('when unknown target profile ids are passed', function () {
    it('should throw a NotFound error', async function () {
      // given
      targetProfileRepository.findByIds.withArgs(uniqTargetProfileIds).resolves([]);
      targetProfileShareRepository.addTargetProfilesToOrganization.throws(new Error('I should not be called'));

      // when
      const err = await catchErr(attachTargetProfilesToOrganization)({
        organizationId,
        targetProfileIds,
        targetProfileRepository,
        targetProfileShareRepository,
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
      targetProfileShareRepository.addTargetProfilesToOrganization.resolves();

      // when
      await attachTargetProfilesToOrganization({
        organizationId,
        targetProfileIds,
        targetProfileRepository,
        targetProfileShareRepository,
      });

      // then
      expect(targetProfileShareRepository.addTargetProfilesToOrganization).to.have.been.calledWithExactly({
        organizationId,
        targetProfileIdList: uniqTargetProfileIds,
      });
    });
  });
});
