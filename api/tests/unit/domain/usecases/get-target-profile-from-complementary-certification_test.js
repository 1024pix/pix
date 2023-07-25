import { expect, domainBuilder, sinon } from '../../../test-helper.js';
import { getTargetProfileFromComplementaryCertification } from '../../../../lib/domain/usecases/get-target-profile-from-complementary-certification.js';

describe('Unit | UseCase | get-target-profile-from-complementary-certification', function () {
  let complementaryCertificationRepository;

  beforeEach(function () {
    complementaryCertificationRepository = {
      getTargetProfileById: sinon.stub(),
    };
  });

  it('should get the complementary certification', async function () {
    // given
    const complementaryCertification = domainBuilder.buildComplementaryCertificationTargetProfileHistory();
    complementaryCertificationRepository.getTargetProfileById.resolves(complementaryCertification);

    // when
    const result = await getTargetProfileFromComplementaryCertification({
      complementaryCertificationId: 1,
      complementaryCertificationRepository,
    });

    // then
    expect(result).to.deep.equal(complementaryCertification);
  });
});
