const { expect, catchErr, sinon, domainBuilder } = require('../../../test-helper');
const Membership = require('../../../../lib/domain/models/Membership');
const Organization = require('../../../../lib/domain/models/Organization');
const OrganizationTag = require('../../../../lib/domain/models/OrganizationTag');
const domainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const createProOrganizations = require('../../../../lib/domain/usecases/create-pro-organizations-with-tags');
const organizationInvitationService = require('../../../../lib/domain/services/organization-invitation-service');

const organizationValidator = require('../../../../lib/domain/validators/organization-with-tags-script');

const {
  ManyOrganizationsFoundError,
  ObjectValidationError,
  OrganizationAlreadyExistError,
  OrganizationTagNotFound,
} = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-pro-organizations-with-tags', function () {
  let organizationRepositoryStub;
  let organizationTagRepositoryStub;
  let organizationInvitationRepositoryStub;

  const allTags = [
    { id: 1, name: 'TAG1' },
    { id: 2, name: 'TAG2' },
    { id: 3, name: 'TAG3' },
  ];

  let tagRepositoryStub;

  beforeEach(function () {
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

    domainTransaction.execute = (lambda) => {
      return lambda(Symbol());
    };

    sinon.stub(organizationInvitationService, 'createProOrganizationInvitation').resolves();
    sinon.stub(organizationValidator, 'validate');
  });

  it('should throw an ObjectValidationError if organizations are undefined', async function () {
    // given
    const organizations = undefined;

    // when
    const error = await catchErr(createProOrganizations)({ organizations });

    // then
    expect(error).to.be.an.instanceOf(ObjectValidationError);
    expect(error.message).to.be.equals('Les organisations ne sont pas renseignées.');
  });

  it('should throw an error if the same organization appears twice', async function () {
    // given
    const organizations = [{ externalId: 'externalId' }, { externalId: 'externalId' }];

    // when
    const error = await catchErr(createProOrganizations)({ organizations });

    // then
    expect(error).to.be.an.instanceOf(ManyOrganizationsFoundError);
  });

  it('should validate organization data before trying to create organizations', async function () {
    // given
    const organizations = [
      { name: '', externalId: 'AB1234', email: 'fake@axample.net', createdBy: 4, tags: 'tag1_tag2' },
    ];

    // when
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateProOrganizations.resolves(organizations);

    // when
    await createProOrganizations({
      domainTransaction,
      organizations: organizations,
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      organizationTagRepository: organizationTagRepositoryStub,
    });

    // then
    expect(organizationValidator.validate).to.have.been.calledWith(organizations[0]);
  });

  it('should throw an error when organization tags not exists', async function () {
    // given
    const firstOrganization = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'TagNotFound',
      type: 'PRO',
      email: 'fake@axample.net',
      createdBy: 4,
    };
    const secondOrganization = {
      id: 2,
      name: 'organization B',
      externalId: 'externalId B',
      tags: 'Tag1_Tag2',
      type: 'PRO',
      email: 'fake@axample.net',
      createdBy: 4,
    };

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
    expect(error.message).to.be.equal("Le tag TagNotFound de l'organisation organization A n'existe pas.");
  });

  it('should add organizations into database', async function () {
    // given
    const organization = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'Tag1_Tag2_Tag3',
      type: 'PRO',
      email: 'fake@axample.net',
      createdBy: 4,
    };

    const expectedProOrganizationToInsert = [new Organization({ ...organization })];
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

  it('should add organization tags when exists', async function () {
    // given
    const firstOrganization = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'Tag1',
      type: 'PRO',
      email: 'fake@axample.net',
      createdBy: 4,
    };
    const secondOrganization = {
      id: 2,
      name: 'organization B',
      externalId: 'externalId B',
      tags: 'Tag1_Tag2',
      type: 'PRO',
      email: 'fake@axample.net',
      createdBy: 4,
    };

    const expectedOrganizationTag1ToInsert = new OrganizationTag({ organizationId: firstOrganization.id, tagId: 1 });
    const expectedOrganizationTag2ToInsert = new OrganizationTag({ organizationId: secondOrganization.id, tagId: 1 });
    const expectedOrganizationTag3ToInsert = new OrganizationTag({ organizationId: secondOrganization.id, tagId: 2 });
    const expectedOrganizationTagsToInsert = [
      expectedOrganizationTag1ToInsert,
      expectedOrganizationTag2ToInsert,
      expectedOrganizationTag3ToInsert,
    ];

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

  it('should create invitation for organizations with email and role', async function () {
    // given
    const firstOrganizationWithAdminRole = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'Tag1',
      email: 'organizationA@exmaple.net',
      organizationInvitationRole: Membership.roles.ADMIN,
      locale: 'en',
      type: 'PRO',
      createdBy: 4,
    };
    const secondOrganizationWithMemberRole = {
      id: 2,
      name: 'organization B',
      externalId: 'externalId B',
      tags: 'Tag2',
      email: 'organizationB@exmaple.net',
      organizationInvitationRole: Membership.roles.MEMBER,
      type: 'PRO',
      createdBy: 4,
    };

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateProOrganizations.resolves([
      domainBuilder.buildOrganization(firstOrganizationWithAdminRole),
      domainBuilder.buildOrganization(secondOrganizationWithMemberRole),
    ]);

    // when
    await createProOrganizations({
      domainTransaction,
      organizations: [firstOrganizationWithAdminRole, secondOrganizationWithMemberRole],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      organizationTagRepository: organizationTagRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
    });

    // then
    expect(organizationInvitationService.createProOrganizationInvitation).to.have.been.calledWith({
      organizationRepository: organizationRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationId: firstOrganizationWithAdminRole.id,
      name: firstOrganizationWithAdminRole.name,
      email: firstOrganizationWithAdminRole.email,
      role: firstOrganizationWithAdminRole.organizationInvitationRole,
      locale: firstOrganizationWithAdminRole.locale,
    });
    expect(organizationInvitationService.createProOrganizationInvitation).to.have.been.calledWith({
      organizationRepository: organizationRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationId: secondOrganizationWithMemberRole.id,
      name: secondOrganizationWithMemberRole.name,
      email: secondOrganizationWithMemberRole.email,
      role: secondOrganizationWithMemberRole.organizationInvitationRole,
      locale: secondOrganizationWithMemberRole.locale,
    });
  });

  it('should not create invitation if organization email is empty', async function () {
    // given
    const organizationWithoutEmail = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'TAG1',
      email: null,
      type: 'PRO',
      createdBy: 4,
    };

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

  context('when an organization already exists in database', function () {
    it('should throw an error', async function () {
      // given

      const organizations = [
        { externalId: 'Ab1234', name: 'fake', email: 'fake@axample.net', createdBy: 4 },
        { externalId: 'Cd456', name: 'fake', email: 'fake@axample.net', createdBy: 4 },
      ];
      organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([
        { id: '1', externalId: 'Ab1234' },
        { id: '2', externalId: 'Cd456' },
      ]);

      // when
      const error = await catchErr(createProOrganizations)({
        organizations,
        organizationRepository: organizationRepositoryStub,
      });

      // then
      expect(error).to.be.an.instanceOf(OrganizationAlreadyExistError);
      expect(error.message).to.equal('Les organisations avec les externalIds suivants : Ab1234, Cd456 existent déjà.');
    });
  });
});
