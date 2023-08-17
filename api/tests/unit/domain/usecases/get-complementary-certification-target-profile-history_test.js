import { getComplementaryCertificationTargetProfileHistory } from '../../../../lib/domain/usecases/get-complementary-certification-target-profile-history.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-complementary-certification-target-profile-history', function () {
  let complementaryCertificationTargetProfileHistoryRepository;

  beforeEach(function () {
    complementaryCertificationTargetProfileHistoryRepository = {
      getByComplementaryCertificationId: sinon.stub(),
    };
  });

  it('should get the complementary certification', async function () {
    // given
    const complementaryCertification = domainBuilder.buildComplementaryCertificationTargetProfileHistory();
    complementaryCertificationTargetProfileHistoryRepository.getByComplementaryCertificationId.resolves(
      complementaryCertification,
    );

    // when
    const result = await getComplementaryCertificationTargetProfileHistory({
      complementaryCertificationId: 1,
      complementaryCertificationTargetProfileHistoryRepository,
    });

    // then
    expect(result).to.deep.equal(complementaryCertification);
  });
});
