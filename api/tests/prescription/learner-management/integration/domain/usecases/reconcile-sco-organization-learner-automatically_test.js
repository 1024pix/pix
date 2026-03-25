import { OrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearner.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
import { UserCouldNotBeReconciledError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | UseCases | reconcile-sco-organization-learner-automatically', function () {
  context('When organization has learner import feature', function () {
    context('When organisation learner is found', function () {
      it('should reconcile learner', async function () {
        // when
        const learnerImportFeatureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT).id;
        const importFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
          name: 'GENERIC',
          fileType: 'csv',
          config: {
            acceptedEncoding: ['utf-8'],
            unicityColumns: ['ine'],
            headers: [
              { name: 'Nom', required: true, config: { property: 'lastName' } },
              { name: 'Prénom', required: true, config: { property: 'firstName' } },
              { name: 'Date de naissance', required: true, config: { attributeProperty: 'birthdate' } },
              { name: 'INE', required: true, config: { attributeProperty: 'ine' } },
            ],
          },
        });
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationFeature({
          organizationId,
          featureId: learnerImportFeatureId,
          params: { organizationLearnerImportFormatId: importFormat.id },
        });
        const userId = databaseBuilder.factory.buildUser().id;

        const learner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
          firstName: 'Hélo',
          lastName: 'de Die',
          attributes: {
            ine: '1234',
          },
        });

        // least recent learner in other organization
        databaseBuilder.factory.buildOrganizationLearner({
          userId: userId,
          firstName: 'Hélo',
          lastName: 'de Die',
          attributes: {
            ine: '1234',
          },
          updatedAt: '2025-01-13',
        });
        // most recent learner in other organization
        databaseBuilder.factory.buildOrganizationLearner({
          userId: userId,
          firstName: 'Hélo',
          lastName: 'de Die',
          attributes: {
            ine: '1234',
          },
          updatedAt: '2025-05-21',
        });

        await databaseBuilder.commit();

        // when
        const result = await usecases.reconcileScoOrganizationLearnerAutomatically({
          userId: userId,
          organizationId,
        });
        expect(result).to.be.instanceOf(OrganizationLearner);
        expect(result).deep.equal(
          new OrganizationLearner({
            id: learner.id,
            firstName: learner.firstName,
            lastName: learner.lastName,
            organizationId,
            birthdate: learner.attributes.birthdate,
            userId,
            attributes: learner.attributes,
          }),
        );
      });
    });
    context('When there is no previous learners', function () {
      it('should throw a UserCouldNotBeReconciledError code error', async function () {
        // when
        const learnerImportFeatureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT).id;
        const importFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
          name: 'GENERIC',
          fileType: 'csv',
          config: {
            acceptedEncoding: ['utf-8'],
            unicityColumns: ['ine'],
            headers: [
              { name: 'Nom', required: true, config: { property: 'lastName' } },
              { name: 'Prénom', required: true, config: { property: 'firstName' } },
              { name: 'Date de naissance', required: true, config: { attributeProperty: 'birthdate' } },
              { name: 'INE', required: true, config: { attributeProperty: 'ine' } },
            ],
          },
        });
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationFeature({
          organizationId,
          featureId: learnerImportFeatureId,
          params: { organizationLearnerImportFormatId: importFormat.id },
        });
        const userId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
          firstName: 'Hélo',
          lastName: 'de Die',
          attributes: {
            ine: '1234',
          },
        });

        await databaseBuilder.commit();

        // when
        const error = await catchErr(usecases.reconcileScoOrganizationLearnerAutomatically)({
          userId: userId,
          organizationId,
        });
        expect(error).to.be.instanceOf(UserCouldNotBeReconciledError);
      });
    });

    context('When there is no matching learners', function () {
      it('should throw a UserCouldNotBeReconciledError code error', async function () {
        // when
        const learnerImportFeatureId = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT).id;
        const importFormat = databaseBuilder.factory.buildOrganizationLearnerImportFormat({
          name: 'GENERIC',
          fileType: 'csv',
          config: {
            acceptedEncoding: ['utf-8'],
            unicityColumns: ['ine'],
            headers: [
              { name: 'Nom', required: true, config: { property: 'lastName' } },
              { name: 'Prénom', required: true, config: { property: 'firstName' } },
              { name: 'Date de naissance', required: true, config: { attributeProperty: 'birthdate' } },
              { name: 'INE', required: true, config: { attributeProperty: 'ine' } },
            ],
          },
        });
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationFeature({
          organizationId,
          featureId: learnerImportFeatureId,
          params: { organizationLearnerImportFormatId: importFormat.id },
        });
        const userId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          userId: null,
          firstName: 'Hélo',
          lastName: 'de Die',
          attributes: {
            ine: '9876',
          },
        });

        databaseBuilder.factory.buildOrganizationLearner({
          userId: userId,
          firstName: 'Hélo',
          lastName: 'de Die',
          attributes: {
            ine: '1234',
          },
          updatedAt: '2025-05-21',
        });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(usecases.reconcileScoOrganizationLearnerAutomatically)({
          userId: userId,
          organizationId,
        });
        expect(error).to.be.instanceOf(UserCouldNotBeReconciledError);
      });
    });
  });
  context("When organization don't rely learner import feature", function () {
    context('When user has no nationalStudentId', function () {
      it('should throw a UserCouldNotBeReconciledError code error', async function () {
        // when
        const organization = databaseBuilder.factory.buildOrganization();
        const user = databaseBuilder.factory.buildUser();

        databaseBuilder.factory.buildOrganizationLearner({
          userId: user.id,
          nationalStudentId: null,
          firstName: 'old-learner-in-orga-without-import',
        });

        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: null,
          nationalStudentId: '1234',
          firstName: 'new-learner-in-sco-with-import',
        });
        databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: null,
          nationalStudentId: null,
          firstName: '(anonymised)',
          deletedAt: new Date(),
        });

        await databaseBuilder.commit();

        const error = await catchErr(usecases.reconcileScoOrganizationLearnerAutomatically)({
          organizationId: organization.id,
          userId: user.id,
        });

        // then
        expect(error).to.be.instanceof(UserCouldNotBeReconciledError);
      });
    });
  });
});
