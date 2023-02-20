import { expect } from '../../../test-helper';
import ParticipationForCampaignManagement from '../../../../lib/domain/models/ParticipationForCampaignManagement';

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
