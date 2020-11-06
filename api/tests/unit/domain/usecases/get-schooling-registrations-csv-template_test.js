const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getSchoolingRegistrationsCsvTemplate = require('../../../../lib/domain/usecases/get-schooling-registrations-csv-template');
const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-schooling-registrations-csv-template', () => {

  const userId = Symbol('userId');
  const organizationId = Symbol('organizationId');
  const membershipRepository = { findByUserIdAndOrganizationId: _.noop };

  context('When user is ADMIN in a SUP organization managing students', () => {
    it('should return headers line', async () => {
      // given
      const organization = domainBuilder.buildOrganization({ isManagingStudents: true, type: 'SUP' });
      const membership = domainBuilder.buildMembership({ organizationRole: 'ADMIN', organization });
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([membership]);

      // when
      const result = await getSchoolingRegistrationsCsvTemplate({ userId, organizationId, membershipRepository });

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

  context('When user is ADMIN in a SUP organization not managing students', () => {
    it('should throw an error', async () => {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: true, organization: { isManagingStudents: false, type: 'SUP' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When user is not ADMIN in a SUP organization', () => {
    it('should throw an error', async () => {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: false, organization: { isManagingStudents: true, type: 'SUP' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When user is ADMIN in a SCO-AGRICULTURE organization managing students', () => {
    it('should return headers line', async () => {
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

  context('When user is ADMIN in a SCO-AGRICULTURE organization not managing students', () => {
    it('should throw an error', async () => {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: true, organization: { isManagingStudents: false, type: 'SCO' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When user is not ADMIN in a SCO-AGRICULTURE organization', () => {
    it('should throw an error', async () => {
      // given
      process.env['AGRICULTURE_ORGANIZATION_ID'] = '1';
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: false, organization: { id: '1', isManagingStudents: true, type: 'SCO' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When user is not a member of the organization', () => {
    it('should throw an error', async () => {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

  context('When user is ADMIN in a SCO organization', () => {
    it('should throw an error', async () => {
      // given
      sinon.stub(membershipRepository, 'findByUserIdAndOrganizationId').resolves([{ isAdmin: true, organization: { isManagingStudents: true, type: 'SCO' } }]);

      // when
      const error = await catchErr(getSchoolingRegistrationsCsvTemplate)({ userId, organizationId, membershipRepository });

      // then
      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});

