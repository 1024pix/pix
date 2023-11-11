import { expect, databaseBuilder, knex, domainBuilder } from '../../../../../test-helper.js';
import * as supOrganizationLearnerRepository from '../../../../../../src/prescription/learner-management/infrastructure/repositories/sup-organization-learner-repository.js';
import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';

describe('Integration | Infrastructure | Repository | sup-organization-learner-repository', function () {
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

    it('should return found organizationLearners with student number', async function () {
      // when
      const result = await supOrganizationLearnerRepository.findOneByStudentNumber({
        organizationId: organization.id,
        studentNumber: '123A',
      });

      // then
      expect(result.id).to.deep.equal(organizationLearner.id);
    });

    it('should return empty array when there is no organization-learners with the given student number', async function () {
      // when
      const result = await supOrganizationLearnerRepository.findOneByStudentNumber({
        organizationId: organization.id,
        studentNumber: '123B',
      });

      // then
      expect(result).to.equal(null);
    });

    it('should return empty array when there is no organization-learners with the given organizationId', async function () {
      // when
      const result = await supOrganizationLearnerRepository.findOneByStudentNumber({
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

        expect(results.length).to.equal(2);
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

          expect(results.length).to.equal(1);
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

          expect(results.length).to.equal(1);
          expect(results[0].studentNumber).to.equal('4');
        });
      });
    });
  });

  describe('#replaceStudents', function () {
    let organization, userId;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();

      await databaseBuilder.commit();
    });

    context('when there is no organization learners for the given organizationId and student number', function () {
      it('creates the organization-learner', async function () {
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

        await supOrganizationLearnerRepository.replaceStudents(
          organization.id,
          [supOrganizationLearner1, supOrganizationLearner2],
          userId,
        );

        const results = await knex('organization-learners')
          .select('*', 'status AS studyScheme')
          .where({ organizationId: organization.id })
          .orderBy('studentNumber');

        expect(results.length).to.equal(2);
        expect(results[0].studentNumber).to.equal('4');
        expect(results[1].studentNumber).to.equal('5');
      });
    });

    context('when there is organization learners for the given organizationId and student number', function () {
      let firstOrganizationLearnerId, secondOrganizationLearnerId;
      beforeEach(async function () {
        firstOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'O-Ren',
          lastName: 'Ishii',
          studentNumber: '4',
          updatedAt: new Date('2000-01-01'),
        }).id;

        secondOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'Monique',
          lastName: 'Du moulin à poivre',
          studentNumber: '5',
          updatedAt: new Date('2000-01-01'),
        }).id;

        await databaseBuilder.commit();
      });

      context('organization-learners', function () {
        it('updates the organization-learners', async function () {
          const expectedOrganizationLearner = domainBuilder.buildSupOrganizationLearner({
            organization,
            firstName: 'O-Ren',
            lastName: 'Ishii updated',
            studentNumber: '4',
            birthdate: '1990-07-01',
          });

          await supOrganizationLearnerRepository.replaceStudents(
            organization.id,
            [expectedOrganizationLearner],
            userId,
          );

          const results = await knex('organization-learners')
            .where({ organizationId: organization.id })
            .whereNull('deletedAt');

          expect(results.length).to.equal(1);
          expect(results[0].lastName).to.equal(expectedOrganizationLearner.lastName);
          expect(results[0].updatedAt).to.not.deep.equal(new Date('2000-01-01'));
        });

        it('delete learners if not present in the new list', async function () {
          await supOrganizationLearnerRepository.replaceStudents(organization.id, [], userId);

          const deletedOrganizationLearners = await knex('organization-learners').whereNotNull('deletedAt');

          expect(deletedOrganizationLearners.length).to.be.equal(2);
          expect(deletedOrganizationLearners[0].studentNumber).to.be.equal('4');
          expect(deletedOrganizationLearners[1].studentNumber).to.be.equal('5');

          expect(deletedOrganizationLearners[0].deletedBy).to.be.equal(userId);
          expect(deletedOrganizationLearners[1].deletedBy).to.be.equal(userId);
        });

        it('does not update already deleted learners', async function () {
          const anotherUserId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildOrganizationLearner({
            organizationId: organization.id,
            deletedAt: new Date('2022-05-01'),
            studentNumber: '666',
            deletedBy: anotherUserId,
          });
          await databaseBuilder.commit();

          const firstLearner = domainBuilder.buildSupOrganizationLearner({
            organization,
            firstName: 'O-Ren',
            lastName: 'Ishii updated',
            studentNumber: '4',
            birthdate: '1990-07-01',
          });
          const secondLearner = domainBuilder.buildSupOrganizationLearner({
            organization,
            firstName: 'Jean',
            lastName: 'BonBeurre',
            studentNumber: '5',
            birthdate: '1986-07-01',
          });

          await supOrganizationLearnerRepository.replaceStudents(
            organization.id,
            [firstLearner, secondLearner],
            userId,
          );

          const deletedOrganizationLearners = await knex('organization-learners')
            .where({ organizationId: organization.id })
            .whereNotNull('deletedAt');

          expect(deletedOrganizationLearners.length).to.be.equal(1);
          expect(deletedOrganizationLearners[0].studentNumber).to.be.equal('666');
          expect(deletedOrganizationLearners[0].deletedAt).to.be.deep.equal(new Date('2022-05-01'));
          expect(deletedOrganizationLearners[0].deletedBy).to.be.equal(anotherUserId);
        });

        it('do not delete learners from another organization', async function () {
          databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'Kaiju',
            lastName: 'Godzilla',
            studentNumber: null,
            updatedAt: new Date('2000-01-01'),
          });

          databaseBuilder.factory.buildOrganizationLearner({
            firstName: 'Kaiju',
            lastName: 'Gidora',
            studentNumber: '4',
            updatedAt: new Date('2000-01-01'),
          });

          await databaseBuilder.commit();

          await supOrganizationLearnerRepository.replaceStudents(organization.id, [], userId);

          const activatedOrganizationLearnerFromAnotherOrganization =
            await knex('organization-learners').whereNull('deletedAt');

          expect(activatedOrganizationLearnerFromAnotherOrganization.length).to.equal(2);
          expect([
            activatedOrganizationLearnerFromAnotherOrganization[0].lastName,
            activatedOrganizationLearnerFromAnotherOrganization[1].lastName,
          ]).to.be.members(['Godzilla', 'Gidora']);

          expect([
            activatedOrganizationLearnerFromAnotherOrganization[0].deletedBy,
            activatedOrganizationLearnerFromAnotherOrganization[1].deletedBy,
          ]).to.be.members([null, null]);
        });
      });

      context('campaign-participations', function () {
        it('delete campaign participations for learners not in the list', async function () {
          const campaigParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId: firstOrganizationLearnerId,
          }).id;
          const anotherParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId: secondOrganizationLearnerId,
          }).id;

          await databaseBuilder.commit();

          await supOrganizationLearnerRepository.replaceStudents(organization.id, [], userId);

          const deletedCampaignParticipations = await knex('campaign-participations').whereNotNull('deletedAt');

          expect(deletedCampaignParticipations.length).to.be.equal(2);
          expect([deletedCampaignParticipations[0].id, deletedCampaignParticipations[1].id]).to.be.members([
            campaigParticipationId,
            anotherParticipationId,
          ]);
          expect([
            deletedCampaignParticipations[0].deletedBy,
            deletedCampaignParticipations[1].deletedBy,
          ]).to.be.members([userId, userId]);
        });

        it('not delete campaign participations already deleted', async function () {
          const anotherUserId = databaseBuilder.factory.buildUser().id;
          const campaigParticipationId = databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId: firstOrganizationLearnerId,
            deletedAt: new Date('2022-05-18'),
            deletedBy: anotherUserId,
          }).id;

          await databaseBuilder.commit();

          await supOrganizationLearnerRepository.replaceStudents(organization.id, [], userId);

          const deletedCampaignParticipations = await knex('campaign-participations')
            .whereNotNull('deletedAt')
            .orderBy('deletedAt', 'DESC');

          expect(deletedCampaignParticipations.length).to.be.equal(1);
          expect(deletedCampaignParticipations[0].id).to.be.equal(campaigParticipationId);
          expect(deletedCampaignParticipations[0].deletedBy).to.be.equal(anotherUserId);
        });

        it('not delete campaign participations from another learner not in the organization', async function () {
          const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
          const anotherLearnerId = databaseBuilder.factory.buildOrganizationLearner({
            organizationId: anotherOrganizationId,
          }).id;

          databaseBuilder.factory.buildCampaignParticipation({
            organizationLearnerId: anotherLearnerId,
          });

          await databaseBuilder.commit();

          await supOrganizationLearnerRepository.replaceStudents(organization.id, [], userId);

          const deletedCampaignParticipations = await knex('campaign-participations').whereNotNull('deletedAt');

          expect(deletedCampaignParticipations.length).to.be.equal(0);
        });
      });
    });

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
        await supOrganizationLearnerRepository.replaceStudents(
          organization2.id,
          [{ ...supOrganizationLearner }],
          userId,
        );

        const results = await knex('organization-learners')
          .select('*', 'status AS studyScheme')
          .where({ organizationId: organization2.id })
          .orderBy('studentNumber');

        expect(results.length).to.equal(1);
        expect(results[0].studentNumber).to.equal('4');
      });
    });

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
          await supOrganizationLearnerRepository.replaceStudents(organization.id, [1], userId);
        } catch (err) {} // eslint-disable-line no-empty

        const result = await knex('organization-learners').select('isDisabled').where({ studentNumber: '4' }).first();

        expect(result.isDisabled).to.be.false;
      });
    });
  });
});
