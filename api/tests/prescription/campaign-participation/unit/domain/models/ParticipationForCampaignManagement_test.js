import { ParticipationForCampaignManagement } from '../../../../../../src/prescription/campaign-participation/domain/models/ParticipationForCampaignManagement.js';

describe('Unit | Domain | Models | ParticipationForCampaignManagement', function () {
  context('#userFullName', function () {
    it('computes the user fullname', function () {
      // when
      const participationForCampaignManagement = new ParticipationForCampaignManagement({
        userFirstName: 'Jacques',
        userLastName: 'Ouche',
      });

      // then
      expect(participationForCampaignManagement.userFullName).to.equal('Jacques Ouche');
    });

    it('is empty if no userFirstName or userLastname', function () {
      // when
      const participationForCampaignManagement = new ParticipationForCampaignManagement({
        userFirstName: '',
        userLastName: '',
      });

      // then
      expect(participationForCampaignManagement.userFullName).to.equal('-');
    });
  });

  context('#deletedByFullName', function () {
    it('computes the deleted fullname', function () {
      // when
      const participationForCampaignManagement = new ParticipationForCampaignManagement({
        deletedAt: new Date(),
        deletedByFirstName: 'Jim',
        deletedByLastName: 'Nastik',
      });

      // then
      expect(participationForCampaignManagement.deletedByFullName).to.equal('Jim Nastik');
    });
  });
});
