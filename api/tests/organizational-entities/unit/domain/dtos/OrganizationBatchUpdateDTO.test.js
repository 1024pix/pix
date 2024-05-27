import { OrganizationBatchUpdateDTO } from '../../../../../src/organizational-entities/domain/dtos/OrganizationBatchUpdateDTO.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Domain | DTO | OrganizationBatchUpdate', function () {
  describe('#constructor', function () {
    it('returns an instance of OrganizationBatchUpdateDTO', function () {
      // given
      const csvData = {
        id: '1',
        name: 'Mon Orga',
        dataProtectionOfficerEmail: 'adam.troisjour@example.net',
      };

      // when
      const organizationBatchUpdateDto = new OrganizationBatchUpdateDTO(csvData);

      // then
      expect(organizationBatchUpdateDto).to.be.instanceOf(OrganizationBatchUpdateDTO);
      expect(organizationBatchUpdateDto).to.deep.equal({
        id: '1',
        name: 'Mon Orga',
        externalId: '',
        parentOrganizationId: '',
        identityProviderForCampaigns: '',
        documentationUrl: '',
        provinceCode: '',
        dataProtectionOfficerLastName: '',
        dataProtectionOfficerFirstName: '',
        dataProtectionOfficerEmail: 'adam.troisjour@example.net',
      });
    });
  });
});
