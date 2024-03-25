import { SupOrganizationLearnerSet } from '../../../../../../src/prescription/learner-management/domain/models/SupOrganizationLearnerSet.js';
import { DomainError, EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Unit | Models | SupOrganizationLearnerSet', function () {
  let i18n, learnerSet;
  const learnerAttributes = {
    studentNumber: '123ABC',
    firstName: 'Tomie',
    middleName: 'The',
    thirdName: 'Artist',
    lastName: 'Katana',
    preferredLastName: 'Yolo',
    email: 'tomie.katana@example.net',
    birthdate: new Date('1980-07-01'),
    diploma: 'Autre',
    department: 'Paxton',
    educationalTeam: 'MiloZotis',
    group: 'Solo',
    studyScheme: 'Autre',
    organizationId: 123,
  };

  beforeEach(function () {
    i18n = getI18n();
    learnerSet = new SupOrganizationLearnerSet(i18n);
  });

  describe('#addLearner', function () {
    it('should add a learner', function () {
      learnerSet.addLearner(learnerAttributes);
      expect(learnerSet.learners.length).to.equal(1);
      expect(learnerSet.learners[0]).to.eql(learnerAttributes);
    });

    it('should add 2 learners', function () {
      const supOrganizationLearnerSet = new SupOrganizationLearnerSet(i18n);

      const learner2 = {
        firstName: 'Bill',
        middleName: 'Unknown',
        thirdName: 'Unknown',
        lastName: 'Unknown',
        preferredLastName: 'Snake Charmer',
        studentNumber: '2',
        email: 'bill@example.net',
        birthdate: new Date('1960-07-01'),
        diploma: 'Autre',
        department: 'Assassination Squad Management',
        educationalTeam: 'Pai Mei',
        group: 'Deadly Viper Assassination Squad',
        studyScheme: 'Autre',
        organizationId: 2,
      };

      supOrganizationLearnerSet.addLearner(learnerAttributes);
      supOrganizationLearnerSet.addLearner(learner2);
      const learners = supOrganizationLearnerSet.learners;

      expect(learners).to.have.lengthOf(2);
      expect(learners[1]).to.deep.equal(learner2);
    });

    it('should throw if learner infos are invalid', async function () {
      const errors = await catchErr(
        learnerSet.addLearner,
        learnerSet,
      )({ firstName: null, lastName: 'Katana', birthdate: new Date('1980-07-01') });
      expect(errors[0]).to.be.an.instanceOf(EntityValidationError);
    });

    it('should throw if there are 2 learners with the same studentNumber', async function () {
      learnerSet.addLearner(learnerAttributes);
      const errors = await catchErr(learnerSet.addLearner, learnerSet)(learnerAttributes);
      expect(learnerSet.learners.length).to.equal(1);
      expect(learnerSet.learners[0]).to.eql(learnerAttributes);
      expect(errors[0]).to.be.an.instanceOf(DomainError);
      expect(errors[0].key).to.equal('studentNumber');
      expect(errors[0].why).to.equal('uniqueness');
    });

    context('When there are warnings', function () {
      it('should add a diploma warning', async function () {
        const supOrganizationLearnerSet = new SupOrganizationLearnerSet(i18n);

        supOrganizationLearnerSet.addLearner({ ...learnerAttributes, diploma: 'BAD' });
        const { learners, warnings } = supOrganizationLearnerSet;

        expect(learners).to.have.lengthOf(1);
        expect(learners[0].diploma).to.equal('Non reconnu');
        expect(warnings).to.have.lengthOf(1);
        expect(warnings[0]).to.deep.equal({ studentNumber: '123ABC', field: 'diploma', value: 'BAD', code: 'unknown' });
      });

      it('should add a study scheme warning', async function () {
        const supOrganizationLearnerSet = new SupOrganizationLearnerSet(i18n);
        const learner = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
          diploma: 'Autre',
          studyScheme: 'BAD',
        };

        supOrganizationLearnerSet.addLearner(learner);
        const { learners, warnings } = supOrganizationLearnerSet;

        expect(learners).to.have.lengthOf(1);
        expect(learners[0].studyScheme).to.equal('Non reconnu');
        expect(warnings).to.have.lengthOf(1);
        expect(warnings[0]).to.deep.equal({
          studentNumber: '123ABC',
          field: 'study-scheme',
          value: 'BAD',
          code: 'unknown',
        });
      });

      it('should check diplomas and study schemes with lower case', async function () {
        const supOrganizationLearnerSet = new SupOrganizationLearnerSet(i18n);
        const learner = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
          diploma: 'aUTRe',
          studyScheme: 'aUTRe',
        };

        supOrganizationLearnerSet.addLearner(learner);
        const { learners, warnings } = supOrganizationLearnerSet;

        expect(learners).to.have.lengthOf(1);
        expect(warnings).to.have.lengthOf(0);
      });

      it('should check diplomas and study schemes with Levenshtein distance', async function () {
        const supOrganizationLearnerSet = new SupOrganizationLearnerSet(i18n);
        const learner = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
          diploma: 'Autra',
          studyScheme: 'Autra',
        };

        supOrganizationLearnerSet.addLearner(learner);
        const { learners, warnings } = supOrganizationLearnerSet;

        expect(learners).to.have.lengthOf(1);
        expect(warnings).to.have.lengthOf(0);
      });
    });

    context('When group has spaces', function () {
      it('should trim group', async function () {
        const supOrganizationLearnerSet = new SupOrganizationLearnerSet(i18n);
        const organizationLearner = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
          diploma: 'BAD',
          studyScheme: 'Autre',
          group: ' some group ',
        };

        supOrganizationLearnerSet.addLearner(organizationLearner);
        const { learners } = supOrganizationLearnerSet;

        expect(learners[0].group).to.equal('some group');
      });

      it('should remove extra space on group', function () {
        const supOrganizationLearnerSet = new SupOrganizationLearnerSet(i18n);
        const learner = {
          firstName: 'Beatrix',
          lastName: 'Kiddo',
          birthdate: '1990-04-01',
          studentNumber: '123ABC',
          organizationId: 123,
          diploma: 'BAD',
          studyScheme: 'Autre',
          group: 'some        group',
        };

        supOrganizationLearnerSet.addLearner(learner);
        const { learners } = supOrganizationLearnerSet;

        expect(learners[0].group).to.equal('some group');
      });
    });
  });
});
