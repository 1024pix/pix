const { expect, catchErr, sinon, domainBuilder } = require('../../../test-helper');
const Organization = require('../../../../lib/domain/models/Organization');
const OrganizationTag = require('../../../../lib/domain/models/OrganizationTag');
const domainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const createProOrganizations = require('../../../../lib/domain/usecases/create-pro-organizations-with-tags');
const organizationInvitationService = require('../../../../lib/domain/services/organization-invitation-service');
const { ManyOrganizationsFoundError, ObjectValidationError, OrganizationAlreadyExistError, OrganizationTagNotFound } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-pro-organizations-with-tags', () => {

  let organizationRepositoryStub;
  let organizationTagRepositoryStub;
  let organizationInvitationRepositoryStub;

  const allTags = [{ id: 1, name: 'TAG1' }, { id: 2, name: 'TAG2' }, { id: 3, name: 'TAG3' }];

  let tagRepositoryStub;

  beforeEach(() => {
    organizationRepositoryStub = {
      findByExternalIdsFetchingIdsOnly: sinon.stub(),
      batchCreateProOrganizations: sinon.stub(),
    };
    organizationTagRepositoryStub = {
      batchCreate: sinon.stub(),
    };
    tagRepositoryStub = {
      findAll: sinon.stub(),
    };
    organizationInvitationRepositoryStub = {};

    domainTransaction.execute = (lambda) => { return lambda(Symbol()); };

    sinon.stub(organizationInvitationService, 'createProOrganizationInvitation').resolves();

  });

  it('should throw an ObjectValidationError if organizations are undefined', async() => {
    // given
    const organizations = undefined;

    // when
    const error = await catchErr(createProOrganizations)({ organizations });

    // then
    expect(error).to.be.an.instanceOf(ObjectValidationError);
    expect(error.message).to.be.equals('Les organisations ne sont pas renseignées.');

  });

  it('should throw an error if the same organization appears twice', async() => {
    // given
    const organizations = [{ externalId: 'externalId' }, { externalId: 'externalId' }];

    // when
    const error = await catchErr(createProOrganizations)({ organizations });

    // then
    expect(error).to.be.an.instanceOf(ManyOrganizationsFoundError);
  });

  context('when an organization already exists in database', () => {

    it('should throw an error', async() => {
      // given
      const organizations = [{ externalId: 'externalId' }];
      organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([{ id: 'id', externalId: 'externalId' }]);

      // when
      const error = await catchErr(createProOrganizations)({ organizations, organizationRepository: organizationRepositoryStub });

      // then
      expect(error).to.be.an.instanceOf(OrganizationAlreadyExistError);
    });
  });

  it('should throw an ObjectValidationError if name is empty or undefined', async () => {
    // given
    const organizations = [{ name: '', externalId: 'externalId' }];

    // when
    const error = await catchErr(createProOrganizations)({ organizations, organizationRepository: organizationRepositoryStub });

    // then
    expect(error).to.be.an.instanceOf(ObjectValidationError);
    expect(error.message).to.be.equals('Le nom de l’organisation n’est pas présent.');
  });

  it('should throw an ObjectValidationError if externalId is empty or undefined', async () => {
    // given
    const organizations = [{ name: 'name', externalId: '' }];

    // when
    const error = await catchErr(createProOrganizations)({ organizations, organizationRepository: organizationRepositoryStub });

    // then
    expect(error).to.be.an.instanceOf(ObjectValidationError);
    expect(error.message).to.be.equals('L’externalId de l’organisation n’est pas présent.');
  });

  it('should add organizations into database', async () => {
    // given
    const organization = { id: 1, name: 'organization A', externalId: 'externalId A', tags: 'Tag1_Tag2_Tag3' };

    const expectedProOrganizationToInsert = [new Organization({ ...organization, type: 'PRO' })];
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateProOrganizations.resolves([organization]);

    // when
    await createProOrganizations({
      domainTransaction,
      organizations: [organization],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      organizationTagRepository: organizationTagRepositoryStub,
    });

    // then
    expect(organizationRepositoryStub.batchCreateProOrganizations).to.be.calledWith(expectedProOrganizationToInsert);
  });

  it('should add organization tags when exists', async ()=> {
    // given
    const firstOrganization = { id: 1, name: 'organization A', externalId: 'externalId A', tags: 'Tag1' };
    const secondOrganization = { id: 2, name: 'organization B', externalId: 'externalId B', tags: 'Tag1_Tag2' };

    const expectedOrganizationTag1ToInsert = new OrganizationTag({ organizationId: firstOrganization.id, tagId: 1 });
    const expectedOrganizationTag2ToInsert = new OrganizationTag({ organizationId: secondOrganization.id, tagId: 1 });
    const expectedOrganizationTag3ToInsert = new OrganizationTag({ organizationId: secondOrganization.id, tagId: 2 });
    const expectedOrganizationTagsToInsert = [expectedOrganizationTag1ToInsert, expectedOrganizationTag2ToInsert, expectedOrganizationTag3ToInsert];

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateProOrganizations.resolves([
      domainBuilder.buildOrganization(firstOrganization),
      domainBuilder.buildOrganization(secondOrganization),
    ]);

    // when
    await createProOrganizations({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      organizationTagRepository: organizationTagRepositoryStub,
    });

    // then
    expect(organizationTagRepositoryStub.batchCreate).to.be.calledWith(expectedOrganizationTagsToInsert);
  });

  it('should throw an error when organization tags not exists', async ()=> {
    // given
    const firstOrganization = { id: 1, name: 'organization A', externalId: 'externalId A', tags: 'TagNotFound' };
    const secondOrganization = { id: 2, name: 'organization B', externalId: 'externalId B', tags: 'Tag1_Tag2' };

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateProOrganizations.resolves([
      domainBuilder.buildOrganization(firstOrganization),
      domainBuilder.buildOrganization(secondOrganization),
    ]);

    // when
    const error = await catchErr(createProOrganizations)({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      organizationTagRepository: organizationTagRepositoryStub,
    });

    // then
    expect(error).to.be.instanceOf(OrganizationTagNotFound);
    expect(error.message).to.be.equal('Le tag de l’organization n’existe pas.');
  });

  it('should create invitation for organizations with email', async () => {
    // given
    const firstOrganization = { id: 1, name: 'organization A', externalId: 'externalId A', tags: 'Tag1', email: 'organizationA@exmaple.net', locale: 'en' };
    const secondOrganization = { id: 2, name: 'organization B', externalId: 'externalId B', tags: 'Tag2', email: 'organizationB@exmaple.net' };

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateProOrganizations.resolves([
      domainBuilder.buildOrganization(firstOrganization),
      domainBuilder.buildOrganization(secondOrganization),
    ]);

    // when
    await createProOrganizations({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      organizationTagRepository: organizationTagRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
    });

    // then
    expect(organizationInvitationService.createProOrganizationInvitation).to.have.been.calledWith({
      organizationRepository: organizationRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationId: firstOrganization.id,
      name: firstOrganization.name,
      email: firstOrganization.email,
      locale: firstOrganization.locale,
    });
    expect(organizationInvitationService.createProOrganizationInvitation).to.have.been.calledWith({
      organizationRepository: organizationRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationId: secondOrganization.id,
      name: secondOrganization.name,
      email: secondOrganization.email,
      locale: secondOrganization.locale,
    });
  });

  it('should not create invitation if organization email is empty', async () => {
    // given
    const organizationWithoutEmail = { id: 1, name: 'organization A', externalId: 'externalId A', tags: 'TAG1', email: null };

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateProOrganizations.resolves([
      domainBuilder.buildOrganization(organizationWithoutEmail),
    ]);

    // when
    await createProOrganizations({
      domainTransaction,
      organizations: [organizationWithoutEmail],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      organizationTagRepository: organizationTagRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
    });

    // then
    expect(organizationInvitationService.createProOrganizationInvitation).to.not.have.been.called;
  });
});
