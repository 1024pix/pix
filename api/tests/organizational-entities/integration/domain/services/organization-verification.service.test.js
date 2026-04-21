import { ADMINISTRATION_TEAM_ROCKET_ID } from '../../../../../db/seeds/data/team-acquisition/constants.js';
import {
  AdministrationTeamNotFound,
  CountryNotFoundError,
  OrganizationLearnerTypeNotFound,
} from '../../../../../src/organizational-entities/domain/errors.js';
import * as organizationVerificationService from '../../../../../src/organizational-entities/domain/services/organization-verification.service.js';
import * as administrationTeamRepository from '../../../../../src/organizational-entities/infrastructure/repositories/administration-team-repository.js';
import * as organizationLearnerTypeRepository from '../../../../../src/organizational-entities/infrastructure/repositories/organization-learner-type-repository.js';
import * as countryRepository from '../../../../../src/shared/infrastructure/repositories/country-repository.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | Services | organization-verification', function () {
  describe('#checkCountryExists', function () {
    describe('when the country exists', function () {
      it('does not throw an error', async function () {
        // given
        const country = databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99425',
          commonName: 'COUNTRY',
          originalName: 'COUNTRY',
        });
        await databaseBuilder.commit();

        // then
        await expect(organizationVerificationService.checkCountryExists(country.code, countryRepository)).not.to.be
          .rejected;
      });
    });

    describe('when the country does not exist', function () {
      it('throws an error', async function () {
        // given
        const unknownCountryCode = 99000;

        // when
        const error = await catchErr(organizationVerificationService.checkCountryExists)(
          unknownCountryCode,
          countryRepository,
        );

        // then
        expect(error).to.deepEqualInstance(
          new CountryNotFoundError({
            message: `Country not found for code ${unknownCountryCode}`,
            meta: { countryCode: unknownCountryCode },
          }),
        );
      });
    });
  });

  describe('#checkOrganizationLearnerTypeExists', function () {
    describe('when the organization learner exists', function () {
      it('does not throw an error', async function () {
        // given
        const organizationLearnerType = databaseBuilder.factory.buildOrganizationLearnerType({
          id: 123,
        });
        await databaseBuilder.commit();

        // then
        await expect(
          organizationVerificationService.checkOrganizationLearnerTypeExists(
            organizationLearnerType.id,
            organizationLearnerTypeRepository,
          ),
        ).not.to.be.rejected;
      });
    });

    describe('when the organization learner type does not exist', function () {
      it('throws an error', async function () {
        // given
        const unknownOrganizationLearnerTypeId = 99000;

        // when
        const error = await catchErr(organizationVerificationService.checkOrganizationLearnerTypeExists)(
          unknownOrganizationLearnerTypeId,
          organizationLearnerTypeRepository,
        );

        // then
        expect(error).to.deepEqualInstance(
          new OrganizationLearnerTypeNotFound({
            message: `Organization learner type not found for id ${unknownOrganizationLearnerTypeId}`,
            meta: {
              organizationLearnerTypeId: unknownOrganizationLearnerTypeId,
            },
          }),
        );
      });
    });
  });

  describe('#checkAdministrationTeamExists', function () {
    describe('when the administration team exists', function () {
      it('does not throw an error', async function () {
        // given
        const administrationTeam = databaseBuilder.factory.buildAdministrationTeam({
          id: ADMINISTRATION_TEAM_ROCKET_ID,
          name: 'Team Rocket',
        });
        await databaseBuilder.commit();

        // then
        await expect(
          organizationVerificationService.checkAdministrationTeamExists(
            administrationTeam.id,
            administrationTeamRepository,
          ),
        ).not.to.be.rejected;
      });
    });

    describe('when the administration team does not exist', function () {
      it('throws an error', async function () {
        // given
        const unknownAdministrationTeamId = 99000;

        // when
        const error = await catchErr(organizationVerificationService.checkAdministrationTeamExists)(
          unknownAdministrationTeamId,
          administrationTeamRepository,
        );

        // then
        expect(error).to.deepEqualInstance(
          new AdministrationTeamNotFound({
            meta: {
              administrationTeamId: unknownAdministrationTeamId,
            },
          }),
        );
      });
    });
  });
});
