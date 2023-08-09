import { expect } from '../../../test-helper.js';
import { DataProtectionOfficer } from '../../../../lib/domain/models/DataProtectionOfficer.js';

describe('Unit | Domain | Models | DataProtectionOfficer', function () {
  describe('#updateInformation', function () {
    it('should update firstName, lastName and email', function () {
      // given
      const dataProtectionOfficer = new DataProtectionOfficer({
        firstName: 'Alex',
        lastName: 'Terieur',
        email: 'alex.terieur@example.net',
      });

      // when
      dataProtectionOfficer.updateInformation({
        firstName: 'alain',
        lastName: 'proviste',
        email: 'alain.proviste@example.net',
      });

      // then
      expect(dataProtectionOfficer).to.contain({
        firstName: 'alain',
        lastName: 'proviste',
        email: 'alain.proviste@example.net',
      });
    });
  });
});
