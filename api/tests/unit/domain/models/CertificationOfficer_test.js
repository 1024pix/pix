import { expect } from '../../../test-helper';
import CertificationOfficer from '../../../../lib/domain/models/CertificationOfficer';

describe('Unit | Domain | Models | CertificationOfficer', function () {
  describe('#getFullName', function () {
    it('should return certification officer full name', function () {
      // when
      const certificationOfficer = new CertificationOfficer({ id: 1234, firstName: 'Chuck', lastName: 'Norris' });

      // then
      expect(certificationOfficer.getFullName()).to.equal('Chuck Norris');
    });
  });
});
