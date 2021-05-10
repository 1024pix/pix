const { expect } = require('../../../test-helper');
const CertificationOfficer = require('../../../../lib/domain/models/CertificationOfficer');

describe('Unit | Domain | Models | CertificationOfficer', () => {

  describe('#getFullName', () => {
    it('should return certification officer full name', () => {
      // when
      const certificationOfficer = new CertificationOfficer({ id: 1234, firstName: 'Chuck', lastName: 'Norris' });

      // then
      expect(certificationOfficer.getFullName()).to.equal('Chuck Norris');
    });
  });
});
