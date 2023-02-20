import { expect, catchErr } from '../../../test-helper';
import { FileValidationError } from '../../../../lib/domain/errors';
import { parseCsvWithHeader, checkCsvHeader } from '../../../../lib/infrastructure/helpers/csv';
import { isEmpty } from 'lodash';

describe('Unit | Infrastructure | Helpers | csv.js', function () {
  const emptyFilePath = `${__dirname}/files/organizations-empty-file.csv`;
  const organizationWithTagsAndTargetProfilesFilePath = `${__dirname}/files/organizations-with-tags-and-target-profiles-test.csv`;
  const withHeaderFilePath = `${__dirname}/files/withHeader-test.csv`;
  const batchOrganizationOptionsWithHeader = {
    skipEmptyLines: true,
    header: true,
    transform: (value, columnName) => {
      if (typeof value === 'string') {
        value = value.trim();
      }
      if (columnName === 'isManagingStudents') {
        value = value?.toLowerCase() === 'true';
      }
      if (!isEmpty(value)) {
        if (
          columnName === 'type' ||
          columnName === 'organizationInvitationRole' ||
          columnName === 'identityProviderForCampaigns'
        ) {
          value = value.toUpperCase();
        }
        if (columnName === 'createdBy') {
          value = parseInt(value, 10);
        }
        if (columnName === 'emailInvitations' || columnName === 'emailForSCOActivation' || columnName === 'DPOEmail') {
          value = value.replaceAll(' ', '').toLowerCase();
        }
      } else {
        if (columnName === 'credit') {
          value = 0;
        }
        if (
          columnName === 'identityProviderForCampaigns' ||
          columnName === 'DPOFirstName' ||
          columnName === 'DPOLastName' ||
          columnName === 'DPOEmail'
        ) {
          value = null;
        }
        if (columnName === 'locale') {
          value = 'fr-fr';
        }
      }
      return value;
    },
  };

  describe('#parseCsvWithHeader', function () {
    it('parses csv file with header', async function () {
      // given
      const expectedItems = [
        { uai: '0080017A', name: 'Collège Les Pixous' },
        { uai: '0080018B', name: 'Lycée Pix' },
        { uai: '0080040A', name: 'Lycée Tant Pix' },
      ];

      // when
      const items = await parseCsvWithHeader(withHeaderFilePath);

      // then
      expect(items.length).to.equal(3);
      expect(items).to.have.deep.members(expectedItems);
    });

    context('with custom transform', function () {
      context('when email column exists', function () {
        it('removes spaces', async function () {
          // given & when
          const data = await parseCsvWithHeader(
            organizationWithTagsAndTargetProfilesFilePath,
            batchOrganizationOptionsWithHeader
          );

          // then
          expect(data[0].emailInvitations).to.equal('team-acces@example.net');
          expect(data[0].DPOEmail).to.equal('superadmin@example.net');
        });
      });

      context('when credits column exists and the value is empty', function () {
        it('returns 0 by default', async function () {
          // given & when
          const data = await parseCsvWithHeader(
            organizationWithTagsAndTargetProfilesFilePath,
            batchOrganizationOptionsWithHeader
          );

          // then
          expect(data[0].credit).to.equal(0);
        });
      });

      context('when locale column exists and the value is empty', function () {
        it('returns fr-fr by default', async function () {
          // given & when
          const data = await parseCsvWithHeader(
            organizationWithTagsAndTargetProfilesFilePath,
            batchOrganizationOptionsWithHeader
          );

          // then
          expect(data[0].locale).to.equal('fr-fr');
        });
      });

      it('converts isManagingStudents to a boolean', async function () {
        // given & when
        const data = await parseCsvWithHeader(
          organizationWithTagsAndTargetProfilesFilePath,
          batchOrganizationOptionsWithHeader
        );

        // then
        expect(data[0].isManagingStudents).to.equal(false);
        expect(data[1].isManagingStudents).to.equal(true);
        expect(data[2].isManagingStudents).to.equal(false);
      });

      it('converts identityProviderForCampaigns to uppercase', async function () {
        // given & when
        const data = await parseCsvWithHeader(
          organizationWithTagsAndTargetProfilesFilePath,
          batchOrganizationOptionsWithHeader
        );

        // then
        expect(data[0].identityProviderForCampaigns).to.equal('POLE_EMPLOI');
      });

      it('converts organizationInvitationRole to uppercase', async function () {
        // given & when
        const data = await parseCsvWithHeader(
          organizationWithTagsAndTargetProfilesFilePath,
          batchOrganizationOptionsWithHeader
        );

        // then
        expect(data[0].organizationInvitationRole).to.equal('ADMIN');
      });

      it('converts type to uppercase', async function () {
        // given & when
        const data = await parseCsvWithHeader(
          organizationWithTagsAndTargetProfilesFilePath,
          batchOrganizationOptionsWithHeader
        );

        // then
        expect(data[0].type).to.equal('PRO');
      });
    });
  });

  describe('#checkCsvHeader', function () {
    context('when headers match', function () {
      it('does nothing', async function () {
        // given
        const headers = ['uai', 'name'];

        // when & then
        await checkCsvHeader({ filePath: withHeaderFilePath, requiredFieldNames: headers });
      });
    });

    context('when headers does not match', function () {
      it('throws a validation error', async function () {
        // given
        const headers = ['uai', 'Name'];

        // when
        const error = await catchErr(checkCsvHeader)({ filePath: withHeaderFilePath, requiredFieldNames: headers });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('MISSING_REQUIRED_FIELD_NAMES');
        expect(error.meta).to.equal('Colonne(s) manquante(s) ou erronée(s) : Name');
      });
    });

    context('when the file is empty', function () {
      it('throws a validation error', async function () {
        // given
        const headers = ['uai', 'name'];

        // when
        const error = await catchErr(checkCsvHeader)({ filePath: emptyFilePath, requiredFieldNames: headers });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.meta).to.equal('Le fichier ne contient aucune donnée');
      });
    });
  });
});
