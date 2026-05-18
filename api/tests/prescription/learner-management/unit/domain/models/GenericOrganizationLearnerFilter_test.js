import { GenericOrganizationLearnerFilter } from '../../../../../../src/prescription/learner-management/domain/models/GenericOrganizationLearnerFilter.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Models | GenericOrganizationLearnerFilter', function () {
  describe('#constructor', function () {
    it('should create a GenericOrganizationLearnerFilter from parameters', function () {
      // given
      const input = {
        organizationId: 1,
        userId: 2,
        attributeName: 'Kimberley',
        values: ['Tartine'],
        email: 'test@example.net',
        'date de naissance': '2000-01-01',
      };

      // when
      const learnerFilter = new GenericOrganizationLearnerFilter(input);

      // then
      expect(learnerFilter).to.deep.equal({
        organizationId: input.organizationId,
        attributeName: input.attributeName,
        values: input.values,
      });
    });
  });

  describe('#dataToInsert', function () {
    it('should map model to database entity and sorting value', function () {
      const input = {
        organizationId: 1,
        attributeName: 'Kimberley',
        values: ['Noisette', 'Tartine', 'Confiture'],
      };

      // when
      const learnerFilter = new GenericOrganizationLearnerFilter(input);

      // when
      const dataToInsert = learnerFilter.dataToInsert;

      // then
      expect(dataToInsert.organization_id).equal(input.organizationId);
      expect(dataToInsert.attribute_name).equal(input.attributeName);
      expect(dataToInsert.values).equal('["Confiture","Noisette","Tartine"]');
    });
  });
});
