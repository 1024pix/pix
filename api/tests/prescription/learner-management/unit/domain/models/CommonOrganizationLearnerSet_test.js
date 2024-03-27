import {
  CommonOrganizationLearner,
  ImportOrganizationLearnerSet,
} from '../../../../../../src/prescription/learner-management/domain/models/CommonOrganizationLearnerSet.js';
import { ModelValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Unit | Models | ImportOrganizationLearnerSet', function () {
  let learnerSet;
  const learnerAttributes = {
    firstName: 'Tomie',
    lastName: 'Katana',
    organizationId: 123,
    preferredLastName: 'Yolo',
    email: 'tomie.katana@example.net',
    birthdate: '34',
    diploma: 'Autre',
    department: 'Paxton',
    educationalTeam: 'MiloZotis',
    group: 'Solo',
    studyScheme: 'Autre',
  };
  let validationRules;

  beforeEach(function () {
    validationRules = {};
  });

  describe('#addLearner', function () {
    it('should add a learner', function () {
      learnerSet = new ImportOrganizationLearnerSet(validationRules);

      learnerSet.addLearner(learnerAttributes);

      expect(learnerSet.learners).to.lengthOf(1);
      expect(learnerSet.learners[0]).to.be.an.instanceOf(CommonOrganizationLearner);
      expect(learnerSet.learners).to.deep.equal([new CommonOrganizationLearner(learnerAttributes)]);
    });

    it('should return multiple learners', function () {
      learnerSet = new ImportOrganizationLearnerSet(validationRules);

      learnerSet.addLearner(learnerAttributes);
      learnerSet.addLearner(learnerAttributes);

      expect(learnerSet.learners).to.lengthOf(2);
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

          expect(error[0].why).to.equal('uniqueness');
          expect(error[0].code).to.equal('PROPERTY_NOT_UNIQ');
        });

        it('should throw unicity errors on multiple attributes', async function () {
          validationRules = {
            unicity: ['firstName', 'group'],
          };

          learnerSet = new ImportOrganizationLearnerSet(validationRules);

          learnerSet.addLearner(learnerAttributes);
          const errors = await catchErr(learnerSet.addLearner, learnerSet)(learnerAttributes);

          expect(errors[0].why).to.equal('uniqueness');
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
            formats: [{ name: 'birthdate', type: 'date', format: 'YYYY-MM-DD', required: true }],
          };

          learnerSet = new ImportOrganizationLearnerSet(validationRules);

          const error = await catchErr(learnerSet.addLearner, learnerSet)(learnerAttributes);
          expect(error[0].why).to.equal('date_format');
        });
      });
      context('With several rules', function () {
        it('should throw all errors', async function () {
          validationRules = {
            unicity: ['firstName', 'group'],
            formats: [{ name: 'birthdate', type: 'date', format: 'YYYY-MM-DD', required: true }],
          };

          const secondLearnersAttributes = {
            firstName: 'Tomie',
            lastName: 'Katana',
            organizationId: 123,
            preferredLastName: 'Yolo',
            email: 'tomie.katana@example.net',
            birthdate: '2002-04-01',
            diploma: 'Autre',
            department: 'Paxton',
            educationalTeam: 'MiloZotis',
            group: 'Solo',
            studyScheme: 'Autre',
          };

          learnerSet = new ImportOrganizationLearnerSet(validationRules);

          const firstError = await catchErr(learnerSet.addLearner, learnerSet)(learnerAttributes);
          const secondError = await catchErr(learnerSet.addLearner, learnerSet)(secondLearnersAttributes);

          expect(firstError[0]).to.be.an.instanceOf(ModelValidationError);
          expect(firstError[0].why).to.equal('date_format');
          expect(secondError[0].why).to.equal('uniqueness');
        });
      });
    });
  });
});
