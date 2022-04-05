const { expect, databaseBuilder, knex, domainBuilder } = require('../../../test-helper');
const higherSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-schooling-registration-repository');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');

describe('Integration | Infrastructure | Repository | higher-schooling-registration-repository', function () {
  describe('#findOneByStudentNumber', function () {
    let organization;
    let organizationLearner;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization();
      organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        studentNumber: '123A',
      });
      await databaseBuilder.commit();
    });

    it('should return found schoolingRegistrations with student number', async function () {
      // when
      const result = await higherSchoolingRegistrationRepository.findOneByStudentNumber({
        organizationId: organization.id,
        studentNumber: '123A',
      });

      // then
      expect(result.id).to.deep.equal(organizationLearner.id);
    });

    it('should return empty array when there is no schooling-registrations with the given student number', async function () {
      // when
      const result = await higherSchoolingRegistrationRepository.findOneByStudentNumber({
        organizationId: organization.id,
        studentNumber: '123B',
      });

      // then
      expect(result).to.equal(null);
    });

    it('should return empty array when there is no schooling-registrations with the given organizationId', async function () {
      // when
      const result = await higherSchoolingRegistrationRepository.findOneByStudentNumber({
        organizationId: '999',
        studentNumber: '123A',
      });

      // then
      expect(result).to.equal(null);
    });
  });

  describe('#findOneByStudentNumberAndBirthdate', function () {
    let organizationId;
    const studentNumber = '1234567';
    const birthdate = '2000-03-31';

    beforeEach(function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      return databaseBuilder.commit();
    });

    context('When there is no registered schooling registrations', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, studentNumber, birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          birthdate,
          studentNumber: 'XXX',
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no active registered schooling registrations', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          studentNumber,
          birthdate,
          isDisabled: true,
        });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          studentNumber,
          birthdate,
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no schooling registrations for the organization', function () {
      beforeEach(async function () {
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganizationId,
          studentNumber,
          birthdate,
        });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          birthdate,
          studentNumber,
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no schooling registrations with given student number', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, studentNumber: '999', birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          birthdate,
          studentNumber,
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no schooling registrations with given birthdate', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, studentNumber, birthdate: '2000-03-30' });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await higherSchoolingRegistrationRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          birthdate,
          studentNumber,
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is a matching schooling registrations with student number and birthdate', function () {
      let expectedOrganizationLearnerId;
      beforeEach(async function () {
        expectedOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          studentNumber,
          birthdate,
        }).id;
        await databaseBuilder.commit();
      });

      it('should return the schooling registration', async function () {
        // when
        const schoolingRegistration = await higherSchoolingRegistrationRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          studentNumber,
          birthdate,
        });

        // then
        expect(schoolingRegistration).to.be.an.instanceOf(SchoolingRegistration);
        expect(schoolingRegistration.id).to.equal(expectedOrganizationLearnerId);
      });
    });
  });

  describe('#updateStudentNumber', function () {
    it('should update the student number', async function () {
      // given
      const id = databaseBuilder.factory.buildOrganizationLearner({ studentNumber: 12345 }).id;
      await databaseBuilder.commit();

      // when
      await higherSchoolingRegistrationRepository.updateStudentNumber(id, 54321);
      const [organizationLearner] = await knex.select('studentNumber').from('organization-learners').where({ id });
      expect(organizationLearner.studentNumber).to.equal('54321');
    });
  });

  describe('#addStudents', function () {
    afterEach(function () {
      return knex('organization-learners').delete();
    });

    context('when there is no schooling registrations for the given organizationId and student number', function () {
      it('creates the schooling-registration', async function () {
        const organization = databaseBuilder.factory.buildOrganization();
        const higherSchoolingRegistration1 = domainBuilder.buildHigherSchoolingRegistration({
          organization,
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '4',
          birthdate: '1990-07-01',
        });
        const higherSchoolingRegistration2 = domainBuilder.buildHigherSchoolingRegistration({
          organization,
          firstName: 'John',
          lastName: 'Rambo',
          studentNumber: '5',
          birthdate: '1990-07-02',
        });
        await databaseBuilder.commit();

        await higherSchoolingRegistrationRepository.addStudents([
          higherSchoolingRegistration1,
          higherSchoolingRegistration2,
        ]);

        const results = await knex('organization-learners')
          .select('*', 'status AS studyScheme')
          .where({ organizationId: organization.id })
          .orderBy('studentNumber');

        expect(results.length).to.equal(2);
        expect(results[0].studentNumber).to.equal('4');
        expect(results[1].studentNumber).to.equal('5');
      });

      context('when there is schooling registrations for the given organizationId and student number', function () {
        it('updates the schooling-registrations', async function () {
          const organization = databaseBuilder.factory.buildOrganization();
          const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({
            organization,
            firstName: 'O-Ren',
            lastName: 'Ishii',
            studentNumber: '4',
            birthdate: '1990-07-01',
          });

          databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            studentNumber: '4',
            updatedAt: new Date('2000-01-01'),
          });
          await databaseBuilder.commit();

          await higherSchoolingRegistrationRepository.addStudents([
            { ...higherSchoolingRegistration, lastName: 'Ishii updated' },
          ]);

          const results = await knex('organization-learners')
            .select('*', 'status AS studyScheme')
            .where({ organizationId: organization.id })
            .orderBy('studentNumber');

          expect(results.length).to.equal(1);
          expect(results[0].lastName).to.equal('Ishii updated');
          expect(results[0].updatedAt).to.not.deep.equal(new Date('2000-01-01'));
        });
      });

      context(
        'when there is a disabled schooling registrations for the given organizationId and student number',
        function () {
          it('enables the schooling-registrations', async function () {
            const organization = databaseBuilder.factory.buildOrganization();
            databaseBuilder.factory.buildOrganizationLearner({
              organizationId: organization.id,
              studentNumber: '4',
              isDisabled: true,
            });
            await databaseBuilder.commit();

            const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({
              organization,
              studentNumber: '4',
            });
            await higherSchoolingRegistrationRepository.addStudents([higherSchoolingRegistration]);

            const result = await knex('organization-learners')
              .select('isDisabled')
              .where({ organizationId: organization.id })
              .where({ studentNumber: '4' })
              .first();

            expect(result.isDisabled).to.be.false;
          });
        }
      );

      context('when there is schooling registrations for an other organizationId and student number', function () {
        it('creates the schooling-registrations', async function () {
          const organization1 = databaseBuilder.factory.buildOrganization();
          const organization2 = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization1.id, studentNumber: '4' });
          await databaseBuilder.commit();

          const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({
            organization: organization2,
            firstName: 'O-Ren',
            lastName: 'Ishii',
            studentNumber: '4',
            birthdate: '1990-07-01',
          });
          await higherSchoolingRegistrationRepository.addStudents([{ ...higherSchoolingRegistration }]);

          const results = await knex('organization-learners')
            .select('*', 'status AS studyScheme')
            .where({ organizationId: organization2.id })
            .orderBy('studentNumber');

          expect(results.length).to.equal(1);
          expect(results[0].studentNumber).to.equal('4');
        });
      });
    });
  });

  describe('#replaceStudents', function () {
    afterEach(function () {
      return knex('organization-learners').delete();
    });

    context('when there is no schooling registrations for the given organizationId and student number', function () {
      it('creates the schooling-registration', async function () {
        const organization = databaseBuilder.factory.buildOrganization();
        const higherSchoolingRegistration1 = domainBuilder.buildHigherSchoolingRegistration({
          organization,
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '4',
          birthdate: '1990-07-01',
        });
        const higherSchoolingRegistration2 = domainBuilder.buildHigherSchoolingRegistration({
          organization,
          firstName: 'John',
          lastName: 'Rambo',
          studentNumber: '5',
          birthdate: '1990-07-02',
        });
        await databaseBuilder.commit();

        await higherSchoolingRegistrationRepository.replaceStudents(organization.id, [
          higherSchoolingRegistration1,
          higherSchoolingRegistration2,
        ]);

        const results = await knex('organization-learners')
          .select('*', 'status AS studyScheme')
          .where({ organizationId: organization.id })
          .orderBy('studentNumber');

        expect(results.length).to.equal(2);
        expect(results[0].studentNumber).to.equal('4');
        expect(results[1].studentNumber).to.equal('5');
      });

      context('when there is schooling registrations for the given organizationId and student number', function () {
        it('updates the schooling-registrations', async function () {
          const organization = databaseBuilder.factory.buildOrganization();
          const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({
            organization,
            firstName: 'O-Ren',
            lastName: 'Ishii',
            studentNumber: '4',
            birthdate: '1990-07-01',
          });

          databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            studentNumber: '4',
            updatedAt: new Date('2000-01-01'),
          });
          await databaseBuilder.commit();

          await higherSchoolingRegistrationRepository.replaceStudents(organization.id, [
            { ...higherSchoolingRegistration, lastName: 'Ishii updated' },
          ]);

          const results = await knex('organization-learners')
            .select('*', 'status AS studyScheme')
            .where({ organizationId: organization.id })
            .orderBy('studentNumber');

          expect(results.length).to.equal(1);
          expect(results[0].lastName).to.equal('Ishii updated');
          expect(results[0].updatedAt).to.not.deep.equal(new Date('2000-01-01'));
        });
      });
    });

    context(
      'when there is a disabled schooling registrations for the given organizationId and student number',
      function () {
        it('enables the schooling-registrations', async function () {
          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            studentNumber: '4',
            isDisabled: true,
          });
          await databaseBuilder.commit();

          const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({
            organization,
            studentNumber: '4',
          });
          await higherSchoolingRegistrationRepository.replaceStudents(organization.id, [higherSchoolingRegistration]);

          const result = await knex('organization-learners')
            .select('isDisabled')
            .where({ organizationId: organization.id })
            .where({ studentNumber: '4' })
            .first();

          expect(result.isDisabled).to.be.false;
        });
      }
    );

    context('when there is schooling registrations for an other organizationId and student number', function () {
      it('creates the schooling-registrations', async function () {
        const organization1 = databaseBuilder.factory.buildOrganization();
        const organization2 = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization1.id, studentNumber: '4' });
        await databaseBuilder.commit();

        const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({
          organization: organization2,
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '4',
          birthdate: '1990-07-01',
        });
        await higherSchoolingRegistrationRepository.replaceStudents(organization2.id, [
          { ...higherSchoolingRegistration },
        ]);

        const results = await knex('organization-learners')
          .select('*', 'status AS studyScheme')
          .where({ organizationId: organization2.id })
          .orderBy('studentNumber');

        expect(results.length).to.equal(1);
        expect(results[0].studentNumber).to.equal('4');
      });
    });

    context(
      'when there is an enabled schooling registrations for the given organizationId which is not updated',
      function () {
        it('disables the schooling-registrations', async function () {
          const organization = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            studentNumber: '4',
            isDisabled: false,
            updatedAt: new Date('2000-01-01'),
          });
          await databaseBuilder.commit();

          const higherSchoolingRegistration = domainBuilder.buildHigherSchoolingRegistration({
            organization,
            studentNumber: '5',
          });
          await higherSchoolingRegistrationRepository.replaceStudents(organization.id, [higherSchoolingRegistration]);

          const result = await knex('organization-learners')
            .select('isDisabled', 'updatedAt')
            .where({ studentNumber: '4' })
            .first();

          expect(result.isDisabled).to.be.true;
          expect(result.updatedAt).to.not.deep.equal(new Date('2000-01-01'));
        });
      }
    );

    context('when there is a problem', function () {
      it('does not create registrations and does not change existing registrations', async function () {
        const organization = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          studentNumber: '4',
          isDisabled: false,
        });
        await databaseBuilder.commit();

        try {
          await higherSchoolingRegistrationRepository.replaceStudents(organization.id, [1]);
        } catch (err) {} // eslint-disable-line no-empty

        const result = await knex('organization-learners').select('isDisabled').where({ studentNumber: '4' }).first();

        expect(result.isDisabled).to.be.false;
      });
    });
  });
});
