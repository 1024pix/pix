const { expect } = require('../../../test-helper');
const Organization = require('../../../../lib/domain/models/Organization');

describe('Unit | Domain | Models | Organization', () => {

  describe('constructor', () => {

    it('should build an Organization from raw JSON', () => {
      // given
      const user = { firstName: 'John', lastName: 'Doe'  };
      const rawData = {
        id: 1,
        code: 'AZE123',
        name: 'Lycée Jean Rostand',
        type: 'SCO',
        email: 'jr@lycee.fr',
        user: user
      };

      // when
      const organization = new Organization(rawData);

      // then
      expect(organization.id).to.equal(1);
      expect(organization.email).to.equal('jr@lycee.fr');
      expect(organization.type).to.equal('SCO');
      expect(organization.name).to.equal('Lycée Jean Rostand');
      expect(organization.code).to.equal('AZE123');
      expect(organization.user).to.equal(user);
    });

  });

});
