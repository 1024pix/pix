import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import * as organizationLearnerImportFormatRepository from '../../../../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | Organization Learner Management | Organization Learner Import Format', function () {
  describe('#get', function () {
    it('should return import state', async function () {
      // given
      const importConfig = {
        name: 'MY_TEST_EXPORT',
        fileType: 'csv',
        config: {
          acceptedEncoding: ['utf-8'],
          unicityColumns: ['my_column1'],
          validationRules: {
            formats: [
              { name: 'my_column1', type: 'string' },
              { name: 'my_column2', type: 'string' },
            ],
          },
          headers: [
            { name: 'my_column1', required: true, property: 'lastName' },
            { name: 'my_column2', required: true, property: 'firstName' },
          ],
        },
      };

      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const featureId = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
      }).id;

      const organizationLearnerImportId = databaseBuilder.factory.buildOrganizationLearnerImportFormat(importConfig).id;

      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId,
        params: { organizationLearnerImportId },
      });

      await databaseBuilder.commit();

      // when
      const result = await organizationLearnerImportFormatRepository.get(organizationId);

      // then
      expect(result).to.be.an.instanceOf(OrganizationLearnerImportFormat);
      expect(result).to.be.deep.equal(new OrganizationLearnerImportFormat(importConfig));
    });

    it('should return null if nothing was found', async function () {
      const result = await organizationLearnerImportFormatRepository.get(1);

      expect(result).to.equal(null);
    });
  });
});
