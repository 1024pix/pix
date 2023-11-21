import { expect, sinon, catchErr } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { attachTargetProfilesToTraining } from '../../../../../src/devcomp/domain/usecases/attach-target-profiles-to-training.js';

describe('Unit | UseCase | attach-target-profiles-to-training', function () {
  let targetProfileRepository;
  let targetProfileTrainingRepository;
  const trainingId = 1;
  const targetProfileIds = [55, 66, 66];
  const uniqTargetProfileIds = [55, 66];

  beforeEach(function () {
    targetProfileRepository = {
      findByIds: sinon.stub(),
    };
    targetProfileTrainingRepository = {
      create: sinon.stub(),
    };
  });

  context('when unknown target profile ids are passed', function () {
    it('should throw a NotFound error', async function () {
      // given
      targetProfileRepository.findByIds.withArgs(uniqTargetProfileIds).resolves([]);

      // when
      const err = await catchErr(attachTargetProfilesToTraining)({
        trainingId,
        targetProfileIds,
        targetProfileRepository,
        targetProfileTrainingRepository,
      });

      // then
      expect(targetProfileTrainingRepository.create).to.not.have.been.called;
      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal("Le(s) profil cible(s) [55, 66] n'existe(nt) pas.");
    });
  });

  context('when existing target profile ids are passed', function () {
    it('should call repository method to attach target profiles to given training', async function () {
      // given
      targetProfileRepository.findByIds.withArgs(uniqTargetProfileIds).resolves([{ id: 55 }, { id: 66 }]);
      targetProfileTrainingRepository.create.resolves(uniqTargetProfileIds);

      // when
      const attachedTargetProfileIds = await attachTargetProfilesToTraining({
        trainingId,
        targetProfileIds,
        targetProfileRepository,
        targetProfileTrainingRepository,
      });

      // then
      expect(targetProfileTrainingRepository.create).to.have.been.calledWithExactly({
        trainingId,
        targetProfileIds: uniqTargetProfileIds,
      });
      expect(targetProfileRepository.findByIds).to.have.been.calledWithExactly(uniqTargetProfileIds);
      expect(attachedTargetProfileIds).to.deep.equal(uniqTargetProfileIds);
    });

    it('should call findByIds with unique target profiles ids', async function () {
      // given
      targetProfileRepository.findByIds.resolves([{ id: 55 }, { id: 66 }]);
      targetProfileTrainingRepository.create.resolves();

      // when
      await attachTargetProfilesToTraining({
        trainingId,
        targetProfileIds,
        targetProfileRepository,
        targetProfileTrainingRepository,
      });

      // then
      expect(targetProfileRepository.findByIds).to.have.been.calledWithExactly(uniqTargetProfileIds);
    });
  });
});
