const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getSchoolingRegistrationsCsvTemplate = require('../../../../lib/domain/usecases/get-schooling-registrations-csv-template');
const _ = require('lodash');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const { getI18n } = require('../../../tooling/i18n/i18n');

describe('Unit | UseCase | get-schooling-registrations-csv-template', function() {

  const userId = Symbol('userId');
  const organizationId = Symbol('organizationId');
  const membershipRepository = { findByUserIdAndOrganizationId: _.noop };
  const i18n = getI18n();

  context('When user is ADMIN in a SUP organization managing students', function() {
    it('should return headers line', async function() {
      // given
      const organization = domainBuilder.buildOrganization({ isManagingStudents: true, type: 'SUP' });
      const membership = domainBuilder.buildMembership({ organizationRole: 'ADMIN', organization });
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([membership]);

      // when
      const result = await getSchoolingRegistrationsCsvTemplate({ userId, organizationId, membershipRepository, i18n });

      // then
      const csvExpected = '\uFEFF"Premier prénom";' +
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

  context('When user is ADMIN in a SUP organization not managing students', function() {
    it('should throw an error', async function() {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: true, organization: { isManagingStudents: false, type: 'SUP' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('When user is not ADMIN in a SUP organization', function() {
    it('should throw an error', async function() {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: false, organization: { isManagingStudents: true, type: 'SUP' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('When user is ADMIN in a SCO-AGRICULTURE organization managing students', function() {
    it('should return headers line', async function() {
      // given
      const tag = domainBuilder.buildTag({ name: 'AGRICULTURE' });
      const organization = domainBuilder.buildOrganization({ id: '1', isManagingStudents: true, type: 'SCO', tags: [tag] });
      const membership = domainBuilder.buildMembership({ organizationRole: 'ADMIN', organization });
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([membership]);

      // when
      const result = await getSchoolingRegistrationsCsvTemplate({ userId, organizationId, membershipRepository });

      // then
      const csvExpected = '\uFEFF"Identifiant unique*";' +
        '"Premier prénom*";' +
        '"Deuxième prénom";' +
        '"Troisième prénom";' +
        '"Nom de famille*";' +
        '"Nom d\'usage";' +
        '"Date de naissance (jj/mm/aaaa)*";' +
        '"Code commune naissance**";' +
        '"Libellé commune naissance**";' +
        '"Code département naissance*";' +
        '"Code pays naissance*";' +
        '"Statut*";' +
        '"Code MEF*";' +
        '"Division*"\n';

      expect(result).to.deep.equal(csvExpected);
    });
  });

  context('When user is ADMIN in a SCO-AGRICULTURE organization not managing students', function() {
    it('should throw an error', async function() {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: true, organization: { isManagingStudents: false, type: 'SCO' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('When user is not ADMIN in a SCO-AGRICULTURE organization', function() {
    it('should throw an error', async function() {
      // given
      process.env['AGRICULTURE_ORGANIZATION_ID'] = '1';
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: false, organization: { id: '1', isManagingStudents: true, type: 'SCO' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('When user is not a member of the organization', function() {
    it('should throw an error', async function() {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('When user is ADMIN in a SCO organization', function() {
    it('should throw an error', async function() {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: true, organization: { isManagingStudents: true, type: 'SCO' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

});
