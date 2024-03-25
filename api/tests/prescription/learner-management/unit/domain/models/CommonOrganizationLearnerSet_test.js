import {
  CommonOrganizationLearner,
  ImportOrganizationLearnerSet,
} from '../../../../../../src/prescription/learner-management/domain/models/CommonOrganizationLearnerSet.js';
import { EntityValidationRulesError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Unit | Models | ImportOrganizationLearnerSet', function () {
  let learnerSet;
  const learnerAttributes = {
    firstName: 'Tomie',
    lastName: 'Katana',
    organizationId: 123,
    attributes: {
      firstName: 'Tomie',
      lastName: 'Katana',
      preferredLastName: 'Yolo',
      email: 'tomie.katana@example.net',
      birthdate: '34',
      diploma: 'Autre',
      department: 'Paxton',
      educationalTeam: 'MiloZotis',
      group: 'Solo',
      studyScheme: 'Autre',
    },
  };
  let validationRules;

  beforeEach(function () {
    validationRules = {};
  });

  describe('#addLearner', function () {
    it('should add a learner', function () {
      learnerSet = new ImportOrganizationLearnerSet(validationRules);

      learnerSet.addLearner(learnerAttributes);

      expect(learnerSet.getLearners()).to.lengthOf(1);
      expect(learnerSet.getLearners()).to.deep.equal([learnerAttributes]);
      expect(learnerSet.getLearners()[0]).to.be.an.instanceOf(CommonOrganizationLearner);
    });

    it('should return multiple learners', function () {
      learnerSet = new ImportOrganizationLearnerSet(validationRules);

      learnerSet.addLearner(learnerAttributes);
      learnerSet.addLearner(learnerAttributes);

      expect(learnerSet.getLearners()).to.lengthOf(2);
    });

    describe('When has validation rules', function () {
      context('checkUnicityRule', function () {
        it('should throw unicity errors on one attribute', async function () {
          validationRules = {
            unicity: ['group'],
          };

          learnerSet = new ImportOrganizationLearnerSet(validationRules);

          learnerSet.addLearner(learnerAttributes);
          const error = await catchErr(learnerSet.addLearner, learnerSet)(learnerAttributes);

          expect(error[0]).to.be.an.instanceOf(EntityValidationRulesError);
          expect(error[0].why).to.equal('uniqueness');
          expect(error[0].key).to.equal('group');
          expect(error[0].code).to.equal('PROPERTY_NOT_UNIQ');
        });

        it('should throw unicity errors on multiple attributes', async function () {
          validationRules = {
            unicity: ['firstName', 'group'],
          };

          learnerSet = new ImportOrganizationLearnerSet(validationRules);

          learnerSet.addLearner(learnerAttributes);
          const errors = await catchErr(learnerSet.addLearner, learnerSet)(learnerAttributes);

          expect(errors[0]).to.be.an.instanceOf(EntityValidationRulesError);
          expect(errors[0].why).to.equal('uniqueness');
          expect(errors[0].key).to.equal('firstName-group');
          expect(errors[0].code).to.equal('PROPERTY_NOT_UNIQ');
        });

        it('should not throw unicity errors when all unicity attributes are differents', async function () {
          validationRules = {
            unicity: ['firstName', 'group'],
          };

          learnerSet = new ImportOrganizationLearnerSet(validationRules);

          learnerSet.addLearner(learnerAttributes);
          const response = learnerSet.addLearner({
            firstName: 'Tomie',
            attributes: { firstName: 'Tomie', group: 'Cheese' },
          });

          expect(response).to.not.throw;
        });
      });
      context('checkDateRule', function () {
        it('should throw date error when the format is not correct', async function () {
          validationRules = {
            formats: [{ fieldName: 'birthdate', type: 'date', format: 'YYYY-MM-DD', required: true }],
          };

          learnerSet = new ImportOrganizationLearnerSet(validationRules);

          const error = await catchErr(learnerSet.addLearner, learnerSet)(learnerAttributes);
          expect(error[0]).to.be.an.instanceOf(EntityValidationRulesError);
          expect(error[0].why).to.equal('date_format');
          expect(error[0].key).to.equal('birthdate');
          expect(error[0].code).to.equal('FIELD_DATE_FORMAT');
        });
      });
    });
  });
});
