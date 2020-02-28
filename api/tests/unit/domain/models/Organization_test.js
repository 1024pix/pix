const { expect } = require('../../../test-helper');
const Organization = require('../../../../lib/domain/models/Organization');

describe('Unit | Domain | Models | Organization', () => {

  describe('constructor', () => {

    it('should build an Organization from raw JSON', () => {
      // given
      const rawData = {
        id: 1,
        name: 'Lycée Jean Rostand',
        type: 'SCO',
        email: 'jr@lycee.fr',
      };

      // when
      const organization = new Organization(rawData);

      // then
      expect(organization.id).to.equal(1);
      expect(organization.type).to.equal('SCO');
      expect(organization.name).to.equal('Lycée Jean Rostand');
    });

    it('should build an Organization with targetProfile related', () => {
      // given
      const rawData = {
        id: 1,
        name: 'Lycée Jean Rostand',
        type: 'SCO',
        email: 'jr@lycee.fr',
        targetProfileShares: [
          {
            targetProfile: []
          }
        ]
      };
      // when
      const organization = new Organization(rawData);

      // then
      expect(organization.id).to.equal(1);
      expect(organization.targetProfileShares.length).to.equal(1);
    });

  });

});
