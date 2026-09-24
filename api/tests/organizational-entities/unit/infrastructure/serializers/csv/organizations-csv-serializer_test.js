import { expect } from 'chai';

import { deserializeForOrganizationsImport } from '../../../../../../src/organizational-entities/infrastructure/serializers/csv/organizations-csv-serializer.js';
import { FileValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';
import { createTempFile, removeTempFile } from '../../../../../tooling/test-utils/file.js';

const HEADER_COLUMNS = [
  'type',
  'externalId',
  'name',
  'provinceCode',
  'credit',
  'emailInvitations',
  'emailForSCOActivation',
  'identityProviderForCampaigns',
  'organizationInvitationRole',
  'locale',
  'tags',
  'createdBy',
  'documentationUrl',
  'targetProfiles',
  'isManagingStudents',
  'DPOFirstName',
  'DPOLastName',
  'DPOEmail',
  'administrationTeamId',
  'parentOrganizationId',
  'countryCode',
  'organizationLearnerTypeId',
  'categoryId',
];

const DEFAULT_ROW = {
  type: 'pro',
  externalId: 'ext1',
  name: 'ACME',
  provinceCode: '123',
  credit: '10',
  emailInvitations: '',
  emailForSCOActivation: '',
  identityProviderForCampaigns: '',
  organizationInvitationRole: '',
  locale: 'fr-fr',
  tags: '',
  createdBy: '1',
  documentationUrl: '',
  targetProfiles: '',
  isManagingStudents: 'false',
  DPOFirstName: '',
  DPOLastName: '',
  DPOEmail: '',
  administrationTeamId: '1',
  parentOrganizationId: '',
  countryCode: '99123',
  organizationLearnerTypeId: '1',
  categoryId: '1',
};

async function _buildCsvFile(overrides = {}, { header = HEADER_COLUMNS } = {}) {
  const row = { ...DEFAULT_ROW, ...overrides };
  const headerLine = header.join(';');
  const dataLine = header.map((column) => row[column]).join(';');
  return createTempFile('organizations-import.csv', `${headerLine}\n${dataLine}`);
}

describe('Organizational Entities | Unit | Infrastructure | Serializers | CSV | organizations-csv-serializer', function () {
  describe('#deserializeForOrganizationsImport', function () {
    let filePath;

    afterEach(async function () {
      await removeTempFile(filePath);
    });

    context('CSV header validation', function () {
      it('throws a FileValidationError when a required column is missing', async function () {
        // given
        const headerWithoutAdministrationTeamId = HEADER_COLUMNS.filter((column) => column !== 'administrationTeamId');
        filePath = await _buildCsvFile({}, { header: headerWithoutAdministrationTeamId });

        // when
        const error = await catchErr(deserializeForOrganizationsImport)(filePath);

        // then
        expect(error).to.be.instanceOf(FileValidationError);
      });
    });

    context(
      'fields uppercased when provided (type, organizationInvitationRole, identityProviderForCampaigns)',
      function () {
        it('uppercases type', async function () {
          // given
          filePath = await _buildCsvFile({ type: 'pro' });

          // when
          const organizations = await deserializeForOrganizationsImport(filePath);

          // then
          expect(organizations[0].type).to.equal('PRO');
        });

        it('uppercases organizationInvitationRole', async function () {
          // given
          filePath = await _buildCsvFile({ organizationInvitationRole: 'admin' });

          // when
          const organizations = await deserializeForOrganizationsImport(filePath);

          // then
          expect(organizations[0].organizationInvitationRole).to.equal('ADMIN');
        });

        it('uppercases identityProviderForCampaigns', async function () {
          // given
          filePath = await _buildCsvFile({ identityProviderForCampaigns: 'poleEmploi' });

          // when
          const organizations = await deserializeForOrganizationsImport(filePath);

          // then
          expect(organizations[0].identityProviderForCampaigns).to.equal('POLEEMPLOI');
        });

        it('leaves identityProviderForCampaigns to null when not provided', async function () {
          // given
          filePath = await _buildCsvFile({ identityProviderForCampaigns: '' });

          // when
          const organizations = await deserializeForOrganizationsImport(filePath);

          // then
          expect(organizations[0].identityProviderForCampaigns).to.equal(null);
        });
      },
    );

    context('numeric fields parsed as integer when provided, defaulted to null when empty', function () {
      const numericColumnsWithNullDefault = [
        'administrationTeamId',
        'parentOrganizationId',
        'countryCode',
        'organizationLearnerTypeId',
        'categoryId',
        'credit',
      ];

      numericColumnsWithNullDefault.forEach((column) => {
        it(`parses ${column} as an integer when provided`, async function () {
          // given
          filePath = await _buildCsvFile({ [column]: '42' });

          // when
          const organizations = await deserializeForOrganizationsImport(filePath);

          // then
          expect(organizations[0][column]).to.equal(42);
        });

        it(`sets ${column} to null when not provided`, async function () {
          // given
          filePath = await _buildCsvFile({ [column]: '' });

          // when
          const organizations = await deserializeForOrganizationsImport(filePath);

          // then
          expect(organizations[0][column]).to.equal(null);
        });
      });

      it('parses createdBy as an integer when provided', async function () {
        // given
        filePath = await _buildCsvFile({ createdBy: '42' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].createdBy).to.equal(42);
      });

      it('leaves createdBy as an empty string when not provided (unlike other numeric fields)', async function () {
        // given
        filePath = await _buildCsvFile({ createdBy: '' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].createdBy).to.equal('');
      });
    });

    context('email fields normalized when provided (emailInvitations, emailForSCOActivation, DPOEmail)', function () {
      it('strips spaces and lowercases emailInvitations', async function () {
        // given
        filePath = await _buildCsvFile({ emailInvitations: 'John Doe@EXAMPLE.com' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].emailInvitations).to.equal('johndoe@example.com');
      });

      it('strips spaces and lowercases emailForSCOActivation', async function () {
        // given
        filePath = await _buildCsvFile({ emailForSCOActivation: 'Jane Doe@EXAMPLE.com' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].emailForSCOActivation).to.equal('janedoe@example.com');
      });

      it('strips spaces and lowercases DPOEmail', async function () {
        // given
        filePath = await _buildCsvFile({ DPOEmail: 'DPO Contact@EXAMPLE.com' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].DPOEmail).to.equal('dpocontact@example.com');
      });

      it('sets emailForSCOActivation to null when not provided', async function () {
        // given
        filePath = await _buildCsvFile({ emailForSCOActivation: '' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].emailForSCOActivation).to.equal(null);
      });
    });

    context('isManagingStudents', function () {
      it('parses "true" (case-insensitive) as boolean true', async function () {
        // given
        filePath = await _buildCsvFile({ isManagingStudents: 'TRUE' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].isManagingStudents).to.equal(true);
      });

      it('parses any other value as boolean false', async function () {
        // given
        filePath = await _buildCsvFile({ isManagingStudents: '' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].isManagingStudents).to.equal(false);
      });
    });

    context('locale', function () {
      it('defaults to fr-fr when not provided', async function () {
        // given
        filePath = await _buildCsvFile({ locale: '' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].locale).to.equal('fr-fr');
      });

      it('keeps the provided locale unchanged', async function () {
        // given
        filePath = await _buildCsvFile({ locale: 'en' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].locale).to.equal('en');
      });
    });

    context('string fields', function () {
      it('trims surrounding whitespace', async function () {
        // given
        filePath = await _buildCsvFile({ name: '  ACME  ' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].name).to.equal('ACME');
      });

      it('sets externalId to null when not provided', async function () {
        // given
        filePath = await _buildCsvFile({ externalId: '' });

        // when
        const organizations = await deserializeForOrganizationsImport(filePath);

        // then
        expect(organizations[0].externalId).to.equal(null);
      });
    });
  });
});
