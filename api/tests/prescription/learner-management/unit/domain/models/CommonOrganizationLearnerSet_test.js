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
      birthdate: new Date('1980-07-01'),
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
            unicity: ['firstName'],
          };

          learnerSet = new ImportOrganizationLearnerSet(validationRules);

          learnerSet.addLearner(learnerAttributes);
          const error = await catchErr(learnerSet.addLearner, learnerSet)(learnerAttributes);

          expect(error[0]).to.be.an.instanceOf(EntityValidationRulesError);
          expect(error[0].why).to.equal('uniqueness');
          expect(error[0].key).to.equal('firstName');
          expect(error[0].code).to.equal('PROPERTY_NOT_UNIQ');
        });

        it('should throw unicity errors on multiple attributes', async function () {
          validationRules = {
            unicity: ['firstName', 'lastName'],
          };

          learnerSet = new ImportOrganizationLearnerSet(validationRules);

          learnerSet.addLearner(learnerAttributes);
          const errors = await catchErr(learnerSet.addLearner, learnerSet)(learnerAttributes);

          expect(errors[0]).to.be.an.instanceOf(EntityValidationRulesError);
          expect(errors[0].why).to.equal('uniqueness');
          expect(errors[0].key).to.equal('firstName-lastName');
          expect(errors[0].code).to.equal('PROPERTY_NOT_UNIQ');
        });
      });
    });
  });
});
