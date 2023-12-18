import { expect, domainBuilder, sinon } from '../../../../../test-helper.js';
import { getComplementaryCertificationTargetProfileHistory } from '../../../../../../src/certification/complementary-certification/domain/usecases/get-complementary-certification-target-profile-history.js';

describe('Unit | UseCase | get-complementary-certification-target-profile-history', function () {
  let targetProfileHistoryRepository;
  let complementaryCertificationForTargetProfileAttachmentRepository;

  beforeEach(function () {
    targetProfileHistoryRepository = {
      getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId: sinon.stub(),
      getDetachedTargetProfilesHistoryByComplementaryCertificationId: sinon.stub(),
    };
    complementaryCertificationForTargetProfileAttachmentRepository = {
      getById: sinon.stub(),
    };
  });

  it('should get the complementary certification', async function () {
    // given
    const complementaryCertification = domainBuilder.buildComplementaryCertificationForTargetProfileAttachment();
    const complementaryCertificationId = complementaryCertification.id;
    complementaryCertificationForTargetProfileAttachmentRepository.getById
      .withArgs({ complementaryCertificationId })
      .resolves(complementaryCertification);

    const attachedTargetProfileHistoryForAdmin = domainBuilder.buildTargetProfileHistoryForAdmin({
      detachedAt: null,
    });
    const detachedTargetProfileHistoryForAdmin1 = domainBuilder.buildTargetProfileHistoryForAdmin({
      detachedAt: new Date('2022-01-01'),
    });
    const detachedTargetProfileHistoryForAdmin2 = domainBuilder.buildTargetProfileHistoryForAdmin({
      detachedAt: new Date('2021-01-01'),
    });

    targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId
      .withArgs({ complementaryCertificationId })
      .resolves([attachedTargetProfileHistoryForAdmin]);
    targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId
      .withArgs({ complementaryCertificationId })
      .resolves([detachedTargetProfileHistoryForAdmin1, detachedTargetProfileHistoryForAdmin2]);

    // when
    const result = await getComplementaryCertificationTargetProfileHistory({
      complementaryCertificationId,
      targetProfileHistoryRepository,
      complementaryCertificationForTargetProfileAttachmentRepository,
    });

    // then
    expect(result).to.deepEqualInstance(
      domainBuilder.buildComplementaryCertificationTargetProfileHistory({
        ...complementaryCertification,
        targetProfilesHistory: [
          attachedTargetProfileHistoryForAdmin,
          detachedTargetProfileHistoryForAdmin1,
          detachedTargetProfileHistoryForAdmin2,
        ],
      }),
    );
  });
});
