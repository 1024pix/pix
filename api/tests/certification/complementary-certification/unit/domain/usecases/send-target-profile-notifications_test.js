import { expect, sinon } from '../../../../../test-helper.js';
import { sendTargetProfileNotifications } from '../../../../../../src/certification/complementary-certification/domain/usecases/send-target-profile-notifications.js';
import { EmailingAttempt } from '../../../../../../src/shared/mail/domain/models/EmailingAttempt.js';

describe('Unit | UseCase |send-target-profile-notifications', function () {
  it('should send an email to members', async function () {
    // given
    const organizationRepository = {
      getOrganizationUserEmailByCampaignTargetProfileId: sinon.stub(),
    };
    organizationRepository.getOrganizationUserEmailByCampaignTargetProfileId
      .withArgs(789)
      .resolves(['toto@gmail.com', 'tata@gmail.com']);

    const success = EmailingAttempt.success();
    const mailService = {
      sendNotificationToOrganizationMembersForTargetProfileDetached: sinon.stub().resolves(success),
    };

    // when
    await sendTargetProfileNotifications({
      targetProfileIdToDetach: 789,
      complementaryCertification: { label: 'complementary certification label' },
      organizationRepository,
      mailService,
    });

    // then
    expect(
      mailService.sendNotificationToOrganizationMembersForTargetProfileDetached.withArgs({
        email: 'toto@gmail.com',
        complementaryCertificationName: 'complementary certification label',
      }),
    ).to.have.been.calledOnce;
    expect(
      mailService.sendNotificationToOrganizationMembersForTargetProfileDetached.withArgs({
        email: 'tata@gmail.com',
        complementaryCertificationName: 'complementary certification label',
      }),
    ).to.have.been.calledOnce;
  });
});
