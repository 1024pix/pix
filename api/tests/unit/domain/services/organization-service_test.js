const { expect } = require('../../../test-helper');

const organizationService = require('../../../../lib/domain/services/organization-service');

describe('Unit | Service | OrganizationService', () => {

  describe('#generateOrganizationCode', () => {
    it('should exist', () => {
      expect(organizationService.generateOrganizationCode).to.exist.and.to.be.a('function');
    });

    it('should generate a code', () => {
      // When
      const code = organizationService.generateOrganizationCode();

      // Then
      expect(code).to.match(/[A-Z]{4}\d{2}/);
    });

  });

});
