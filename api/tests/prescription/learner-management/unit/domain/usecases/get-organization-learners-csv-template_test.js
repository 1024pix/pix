import _ from 'lodash';

import { UserNotAuthorizedToAccessEntityError } from '../../../../../../lib/domain/errors.js';
import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import { getOrganizationLearnersCsvTemplate } from '../../../../../../src/prescription/learner-management/domain/usecases/get-organization-learners-csv-template.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Unit | UseCase | get-organization-learners-csv-template', function () {
  let userId, organizationId, membershipRepository, organizationLearnerImportFormatRepository, i18n;

  beforeEach(function () {
    userId = Symbol('userId');
    organizationId = Symbol('organizationId');
    membershipRepository = { findByUserIdAndOrganizationId: _.noop };
    organizationLearnerImportFormatRepository = { get: sinon.stub() };
    i18n = getI18n();
  });

  context('When user is ADMIN in an organization with the import feature', function () {
    it('should return headers line', async function () {
      // given
      const organization = domainBuilder.buildOrganization({ isManagingStudents: true, type: 'PRO' });
      const membership = domainBuilder.buildMembership({ organizationRole: 'ADMIN', organization });
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([membership]);
      organizationLearnerImportFormatRepository.get.resolves(
        new OrganizationLearnerImportFormat({
          name: 'GENERIC',
          filetype: 'csv',
          config: {
            headers: [
              { name: 'Nom', property: 'lastName', required: true },
              { name: 'Prénom', property: 'firstName', required: true },
              { name: 'Date de naissance', required: true },
            ],
          },
        }),
      );

      // when
      const result = await getOrganizationLearnersCsvTemplate({
        userId,
        organizationId,
        i18n,
        membershipRepository,
        organizationLearnerImportFormatRepository,
      });

      // then
      const csvExpected = '\uFEFF"Nom";' + '"Prénom";' + '"Date de naissance"\n';
      expect(result).to.deep.equal(csvExpected);
    });
  });

  context('When user is ADMIN in a SUP organization managing students', function () {
    it('should return headers line', async function () {
      // given
      const organization = domainBuilder.buildOrganization({ isManagingStudents: true, type: 'SUP' });
      const membership = domainBuilder.buildMembership({ organizationRole: 'ADMIN', organization });
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([membership]);

      // when
      const result = await getOrganizationLearnersCsvTemplate({
        userId,
        organizationId,
        i18n,
        membershipRepository,
        organizationLearnerImportFormatRepository,
      });

      // then
      const csvExpected =
        '\uFEFF"Premier prénom";' +
        '"Deuxième prénom";' +
        '"Troisième prénom";' +
        '"Nom de famille";' +
        '"Nom d\'usage";' +
        '"Date de naissance (jj/mm/aaaa)";' +
        '"Email";' +
        '"Numéro étudiant";' +
        '"Composante";' +
        '"Équipe pédagogique";' +
        '"Groupe";' +
        '"Diplôme";' +
        '"Régime"\n';
      expect(result).to.deep.equal(csvExpected);
    });
  });

  context('When user is ADMIN in a SUP organization not managing students', function () {
    it('should throw an error', async function () {
      // given
      sinon
        .stub(membershipRepository, 'findByUserIdAndOrganizationId')
        .resolves([{ isAdmin: true, organization: { isManagingStudents: false, type: 'SUP' } }]);

      // when
      const error = await catchErr(getOrganizationLearnersCsvTemplate)({
        userId,
        organizationId,
        membershipRepository,
        organizationLearnerImportFormatRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('When user is not ADMIN', function () {
    it('should throw an error', async function () {
      // given
      sinon
        .stub(membershipRepository, 'findByUserIdAndOrganizationId')
        .resolves([{ isAdmin: false, organization: { isManagingStudents: true, type: 'SUP' } }]);

      // when
      const error = await catchErr(getOrganizationLearnersCsvTemplate)({
        userId,
        organizationId,
        membershipRepository,
        organizationLearnerImportFormatRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('When user is not a member of the organization', function () {
    it('should throw an error', async function () {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([]);

      // when
      const error = await catchErr(getOrganizationLearnersCsvTemplate)({
        userId,
        organizationId,
        membershipRepository,
        organizationLearnerImportFormatRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
