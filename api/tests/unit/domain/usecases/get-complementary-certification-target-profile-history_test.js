import { expect, domainBuilder, sinon } from '../../../test-helper.js';
import { getComplementaryCertificationTargetProfileHistory } from '../../../../lib/domain/usecases/get-complementary-certification-target-profile-history.js';

describe('Unit | UseCase | get-complementary-certification-target-profile-history', function () {
  let complementaryCertificationTargetProfileHistoryRepository;
  let complementaryCertificationRepository;

  beforeEach(function () {
    complementaryCertificationTargetProfileHistoryRepository = {
      getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId: sinon.stub(),
      getDetachedTargetProfilesHistoryByComplementaryCertificationId: sinon.stub(),
    };
    complementaryCertificationRepository = {
      getById: sinon.stub(),
    };
  });

  it('should get the complementary certification', async function () {
    // given
    const complementaryCertification = domainBuilder.buildComplementaryCertification();
    const complementaryCertificationId = complementaryCertification.id;
    complementaryCertificationRepository.getById
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

    complementaryCertificationTargetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId
      .withArgs({ complementaryCertificationId })
      .resolves([attachedTargetProfileHistoryForAdmin]);
    complementaryCertificationTargetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId
      .withArgs({ complementaryCertificationId })
      .resolves([detachedTargetProfileHistoryForAdmin1, detachedTargetProfileHistoryForAdmin2]);

    // when
    const result = await getComplementaryCertificationTargetProfileHistory({
      complementaryCertificationId,
      complementaryCertificationTargetProfileHistoryRepository,
      complementaryCertificationRepository,
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
