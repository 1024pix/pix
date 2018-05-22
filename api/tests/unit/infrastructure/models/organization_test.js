const { expect } = require('../../../test-helper');

const BookshelfOrganization = require('../../../../lib/infrastructure/data/organization');
const DomainOrganization = require('../../../../lib/domain/models/Organization');

describe('Unit | Infrastructure | Data | organization', () => {

  describe('#toDomainEntity', () => {

    it('should convert a Bookshelf object into a Domain entity', () => {
      // given
      const rawData = {
        id: 2,
        email: 'vegeta@bandai.db',
        type: 'PRO',
        name: 'Bandai',
        code: 'SSJ-BLU3'
      };
      const bookshelfOrganization = new BookshelfOrganization(rawData);

      // when
      const domainOrganization = bookshelfOrganization.toDomainEntity();

      // then
      expect(domainOrganization).to.be.an.instanceof(DomainOrganization);
      expect(domainOrganization.id).to.equal(rawData.id);
      expect(domainOrganization.email).to.equal(rawData.email);
      expect(domainOrganization.type).to.equal(rawData.type);
      expect(domainOrganization.name).to.equal(rawData.name);
      expect(domainOrganization.code).to.equal(rawData.code);
    });
  });

});
