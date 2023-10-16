import { expect, domainBuilder, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-complementary-certification-for-target-profile-attachment', function () {
  it('should get the complementary certification', async function () {
    // given
    const complementaryCertificationForTargetProfileAttachmentRepository = {
      getById: sinon.stub(),
    };
    const complementaryCertification = domainBuilder.buildComplementaryCertificationForTargetProfileAttachment({
      id: 123,
      hasExternalJury: true,
    });
    complementaryCertificationForTargetProfileAttachmentRepository.getById
      .withArgs({ complementaryCertificationId: 5, complementaryCertificationForTargetProfileAttachmentRepository })
      .resolves(complementaryCertification);

    // when
    const result = await complementaryCertificationForTargetProfileAttachmentRepository.getById({
      complementaryCertificationId: 5,
      complementaryCertificationForTargetProfileAttachmentRepository,
    });

    // then
    expect(result).to.deepEqualInstance(complementaryCertification);
  });
});
