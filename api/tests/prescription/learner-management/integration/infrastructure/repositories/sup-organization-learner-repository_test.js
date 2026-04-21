import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';
import * as supOrganizationLearnerRepository from '../../../../../../src/prescription/learner-management/infrastructure/repositories/sup-organization-learner-repository.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Infrastructure | Repository | sup-organization-learner-repository', function () {
  describe('#findOneByStudentNumber', function () {
    let organizationId;
    let studentNumber;

    beforeEach(async function () {
      studentNumber = '123A';
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
    });

    context('When there is no registered organization learners', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, studentNumber });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await supOrganizationLearnerRepository.findOneByStudentNumber({
          organizationId,
          studentNumber: 'XXX',
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no active registered organization learners', function () {
      beforeEach(async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          studentNumber,
          isDisabled: true,
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          studentNumber,
          isDisabled: false,
          deletedAt: new Date('2021-01-01'),
          deletedBy: userId,
        });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await supOrganizationLearnerRepository.findOneByStudentNumber({
          organizationId,
          studentNumber,
        });

        // then
        expect(result).to.equal(null);
      });
    });

    it('should return empty array when there is no organization-learners with the given organizationId', async function () {
      //given
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        studentNumber,
      });

      await databaseBuilder.commit();

      // when
      const result = await supOrganizationLearnerRepository.findOneByStudentNumber({
        organizationId: '999',
        studentNumber: '123A',
      });

      // then
      expect(result).to.equal(null);
    });

    it('should return found organizationLearners with student number', async function () {
      //given
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
        studentNumber,
      });

      await databaseBuilder.commit();

      // when
      const result = await supOrganizationLearnerRepository.findOneByStudentNumber({
        organizationId,
        studentNumber: '123A',
      });

      // then
      expect(result.id).to.deep.equal(organizationLearner.id);
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

    context('When there is no registered organization learners', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, studentNumber, birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await supOrganizationLearnerRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          birthdate,
          studentNumber: 'XXX',
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no active registered organization learners', function () {
      beforeEach(async function () {
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          studentNumber,
          birthdate,
          isDisabled: true,
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          studentNumber,
          birthdate,
          isDisabled: false,
          deletedAt: new Date('2021-01-01'),
          deletedBy: userId,
        });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await supOrganizationLearnerRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          studentNumber,
          birthdate,
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no organization learners for the organization', function () {
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
        const result = await supOrganizationLearnerRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          birthdate,
          studentNumber,
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no organization learners with given student number', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, studentNumber: '999', birthdate });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await supOrganizationLearnerRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          birthdate,
          studentNumber,
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is no organization learners with given birthdate', function () {
      beforeEach(async function () {
        databaseBuilder.factory.buildOrganizationLearner({ organizationId, studentNumber, birthdate: '2000-03-30' });
        await databaseBuilder.commit();
      });

      it('should return null', async function () {
        // when
        const result = await supOrganizationLearnerRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          birthdate,
          studentNumber,
        });

        // then
        expect(result).to.equal(null);
      });
    });

    context('When there is a matching organization learners with student number and birthdate', function () {
      let expectedOrganizationLearnerId;

      beforeEach(async function () {
        expectedOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          studentNumber,
          birthdate,
        }).id;
        await databaseBuilder.commit();
      });

      it('should return the organization learner', async function () {
        // when
        const organizationLearner = await supOrganizationLearnerRepository.findOneByStudentNumberAndBirthdate({
          organizationId,
          studentNumber,
          birthdate,
        });

        // then
        expect(organizationLearner).to.be.an.instanceOf(OrganizationLearner);
        expect(organizationLearner.id).to.equal(expectedOrganizationLearnerId);
      });
    });
  });

  describe('#updateStudentNumber', function () {
    it('should update the student number', async function () {
      // given
      const id = databaseBuilder.factory.buildOrganizationLearner({ studentNumber: 12345 }).id;
      await databaseBuilder.commit();

      // when
      await supOrganizationLearnerRepository.updateStudentNumber(id, 54321);
      const [organizationLearner] = await knex.select('studentNumber').from('organization-learners').where({ id });
      expect(organizationLearner.studentNumber).to.equal('54321');
    });
  });

  describe('#addStudents', function () {
    context('when there is no organization learners for the given organizationId and student number', function () {
      it('creates the organization-learner', async function () {
        const organization = databaseBuilder.factory.buildOrganization();
        const supOrganizationLearner1 = domainBuilder.buildSupOrganizationLearner({
          organization,
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '4',
          birthdate: '1990-07-01',
        });
        const supOrganizationLearner2 = domainBuilder.buildSupOrganizationLearner({
          organization,
          firstName: 'John',
          lastName: 'Rambo',
          studentNumber: '5',
          birthdate: '1990-07-02',
        });
        await databaseBuilder.commit();

        await supOrganizationLearnerRepository.addStudents([supOrganizationLearner1, supOrganizationLearner2]);

        const results = await knex('organization-learners')
          .select('*', 'status AS studyScheme')
          .where({ organizationId: organization.id })
          .orderBy('studentNumber');

        expect(results).to.have.lengthOf(2);
        expect(results[0].studentNumber).to.equal('4');
        expect(results[1].studentNumber).to.equal('5');
      });

      context('when there is organization learners for the given organizationId and student number', function () {
        it('updates the organization-learners', async function () {
          const organization = databaseBuilder.factory.buildOrganization();
          const supOrganizationLearner = domainBuilder.buildSupOrganizationLearner({
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

          await supOrganizationLearnerRepository.addStudents([
            { ...supOrganizationLearner, lastName: 'Ishii updated' },
          ]);

          const results = await knex('organization-learners')
            .select('*', 'status AS studyScheme')
            .where({ organizationId: organization.id })
            .orderBy('studentNumber');

          expect(results).to.have.lengthOf(1);
          expect(results[0].lastName).to.equal('Ishii updated');
          expect(results[0].updatedAt).to.not.deep.equal(new Date('2000-01-01'));
        });
      });

      context(
        'when there is a disabled organization learners for the given organizationId and student number',
        function () {
          it('enables the organization-learners', async function () {
            const organization = databaseBuilder.factory.buildOrganization();
            databaseBuilder.factory.buildOrganizationLearner({
              organizationId: organization.id,
              studentNumber: '4',
              isDisabled: true,
            });
            await databaseBuilder.commit();

            const supOrganizationLearner = domainBuilder.buildSupOrganizationLearner({
              organization,
              studentNumber: '4',
            });
            await supOrganizationLearnerRepository.addStudents([supOrganizationLearner]);

            const result = await knex('organization-learners')
              .select('isDisabled')
              .where({ organizationId: organization.id })
              .where({ studentNumber: '4' })
              .first();

            expect(result.isDisabled).to.be.false;
          });
        },
      );

      context('when there is organization learners for an other organizationId and student number', function () {
        it('creates the organization-learners', async function () {
          const organization1 = databaseBuilder.factory.buildOrganization();
          const organization2 = databaseBuilder.factory.buildOrganization();
          databaseBuilder.factory.buildOrganizationLearner({ organizationId: organization1.id, studentNumber: '4' });
          await databaseBuilder.commit();

          const supOrganizationLearner = domainBuilder.buildSupOrganizationLearner({
            organization: organization2,
            firstName: 'O-Ren',
            lastName: 'Ishii',
            studentNumber: '4',
            birthdate: '1990-07-01',
          });
          await supOrganizationLearnerRepository.addStudents([{ ...supOrganizationLearner }]);

          const results = await knex('organization-learners')
            .select('*', 'status AS studyScheme')
            .where({ organizationId: organization2.id })
            .orderBy('studentNumber');

          expect(results).to.have.lengthOf(1);
          expect(results[0].studentNumber).to.equal('4');
        });
      });
    });
  });

  describe('#getOrganizationLearnerIdsNotInList', function () {
    let firstOrganizationLearner, organization, userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();

      firstOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        firstName: 'O-Ren',
        lastName: 'Ishii',
        studentNumber: '4',
        updatedAt: new Date('2000-01-01'),
      });

      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        firstName: 'Monique',
        lastName: 'Du moulin à poivre',
        studentNumber: '5',
        updatedAt: new Date('2000-01-01'),
        deletedAt: new Date('2000-01-01'),
        deletedBy: userId,
      });

      await databaseBuilder.commit();
    });

    it('should return organization active learner wich not matching with student number list', async function () {
      const otherOrga = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildOrganizationLearner({
        organizationId: otherOrga.id,
        deletedAt: null,
        deleteBy: null,
      });
      await databaseBuilder.commit();
      const learners = await supOrganizationLearnerRepository.getOrganizationLearnerIdsNotInList({
        organizationId: organization.id,
        studentNumberList: ['1'],
      });

      expect(learners).lengthOf(1);
      expect(learners).deep.equal([firstOrganizationLearner.id]);
    });
  });
});
