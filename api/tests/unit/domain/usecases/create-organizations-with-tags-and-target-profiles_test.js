import {
  ManyOrganizationsFoundError,
  ObjectValidationError,
  OrganizationAlreadyExistError,
  OrganizationTagNotFound,
} from '../../../../lib/domain/errors.js';
import { OrganizationForAdmin } from '../../../../lib/domain/models/index.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { OrganizationTag } from '../../../../lib/domain/models/OrganizationTag.js';
import { createOrganizationsWithTagsAndTargetProfiles } from '../../../../lib/domain/usecases/create-organizations-with-tags-and-target-profiles.js';
import { DomainTransaction as domainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | create-organizations-with-tags-and-target-profiles', function () {
  let organizationRepositoryStub;
  let organizationTagRepositoryStub;
  let organizationInvitationRepositoryStub;
  let targetProfileShareRepository;
  let dataProtectionOfficerRepository;
  let organizationInvitationService;
  let organizationValidator;

  const allTags = [
    { id: 1, name: 'TAG1' },
    { id: 2, name: 'TAG2' },
    { id: 3, name: 'TAG3' },
  ];

  let tagRepositoryStub;

  beforeEach(function () {
    organizationRepositoryStub = {
      findByExternalIdsFetchingIdsOnly: sinon.stub(),
      batchCreateOrganizations: sinon.stub(),
    };
    organizationTagRepositoryStub = {
      batchCreate: sinon.stub(),
    };
    tagRepositoryStub = {
      findAll: sinon.stub(),
    };
    organizationInvitationRepositoryStub = {};
    targetProfileShareRepository = {
      batchAddTargetProfilesToOrganization: sinon.stub(),
    };
    dataProtectionOfficerRepository = {
      batchAddDataProtectionOfficerToOrganization: sinon.stub(),
    };
    organizationInvitationService = {
      createProOrganizationInvitation: sinon.stub(),
    };
    organizationValidator = {
      validate: sinon.stub(),
    };

    domainTransaction.execute = (lambda) => {
      return lambda(Symbol());
    };

    organizationInvitationService.createProOrganizationInvitation.resolves();
  });

  it('should throw an ObjectValidationError if organizations are undefined', async function () {
    // given
    const organizations = undefined;

    // when
    const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({ organizations });

    // then
    expect(error).to.be.an.instanceOf(ObjectValidationError);
    expect(error.message).to.be.equals('Les organisations ne sont pas renseignées.');
  });

  it('should throw an error if the same organization appears twice', async function () {
    // given
    const organizations = [{ externalId: 'externalId' }, { externalId: 'externalId' }];

    // when
    const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({ organizations });

    // then
    expect(error).to.be.an.instanceOf(ManyOrganizationsFoundError);
  });

  it('should validate organization data before trying to create organizations', async function () {
    // given
    const organizations = [
      {
        name: '',
        externalId: 'AB1234',
        emailInvitations: 'fake@axample.net',
        createdBy: 4,
        tags: 'tag1_tag2',
        targetProfiles: '123',
      },
    ];

    // when
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateOrganizations.resolves(organizations);

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: organizations,
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationValidator,
      organizationInvitationService,
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
      targetProfiles: '123',
      type: 'PRO',
      emailInvitations: 'fake@axample.net',
      createdBy: 4,
    };
    const secondOrganization = {
      id: 2,
      name: 'organization B',
      externalId: 'externalId B',
      tags: 'Tag1_Tag2',
      targetProfiles: '123_765',
      type: 'PRO',
      emailInvitations: 'fake@axample.net',
      createdBy: 4,
    };

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateOrganizations.resolves([
      domainBuilder.buildOrganization(firstOrganization),
      domainBuilder.buildOrganization(secondOrganization),
    ]);

    // when
    const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    expect(error).to.be.instanceOf(OrganizationTagNotFound);
    expect(error.message).to.be.equal("Le tag TagNotFound de l'organisation organization A n'existe pas.");
  });

  it('should add organizations into database ignoring the email for SCO activation for the PRO organization', async function () {
    // given
    const organizationPRO = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'Tag1_Tag2_Tag3',
      targetProfiles: '123_765',
      type: 'PRO',
      emailInvitations: 'fake@example.net',
      createdBy: 4,
      isManagingStudents: true,
      identityProviderForCampaigns: 'POLE_EMPLOI',
      emailForSCOActivation: 'ignoredEmail@example.net',
    };
    const organizationSCO = {
      id: 2,
      name: 'organization B',
      externalId: 'externalId B',
      tags: 'Tag1_Tag2_Tag3',
      targetProfiles: '123_765',
      type: 'SCO',
      emailInvitations: 'fake@example.net',
      createdBy: 4,
      isManagingStudents: true,
      identityProviderForCampaigns: 'GAR',
      emailForSCOActivation: 'savedEmail@example.net',
    };
    const organizationPROToCreate = new OrganizationForAdmin(organizationPRO);
    const organizationSCOToCreate = new OrganizationForAdmin({
      ...organizationSCO,
      email: organizationSCO.emailForSCOActivation,
    });

    const expectedProOrganizationToInsert = [organizationPROToCreate, organizationSCOToCreate];
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateOrganizations.resolves([organizationPROToCreate, organizationSCOToCreate]);

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [organizationPRO, organizationSCO],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    const expectedOrganizationsToCreate = organizationRepositoryStub.batchCreateOrganizations.getCall(0).args[0];
    expect(expectedOrganizationsToCreate).to.deep.equal(expectedProOrganizationToInsert);
  });

  it('should add organization tags when exists', async function () {
    // given
    const firstOrganization = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'Tag1',
      targetProfiles: '123_765',
      type: 'PRO',
      emailInvitations: 'fake@axample.net',
      createdBy: 4,
    };
    const secondOrganization = {
      id: 2,
      name: 'organization B',
      externalId: 'externalId B',
      tags: 'Tag1_Tag2',
      targetProfiles: '765',
      type: 'PRO',
      emailInvitations: 'fake@axample.net',
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
    organizationRepositoryStub.batchCreateOrganizations.resolves([
      domainBuilder.buildOrganization(firstOrganization),
      domainBuilder.buildOrganization(secondOrganization),
    ]);

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    expect(organizationTagRepositoryStub.batchCreate).to.be.calledWith(expectedOrganizationTagsToInsert);
  });

  it('should add organization target profile when exists', async function () {
    // given
    const firstOrganization = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'Tag1',
      targetProfiles: '123_765',
      type: 'PRO',
      emailInvitations: 'fake@axample.net',
      createdBy: 4,
    };
    const secondOrganization = {
      id: 2,
      name: 'organization B',
      externalId: 'externalId B',
      tags: 'Tag1_Tag2',
      targetProfiles: '765',
      type: 'PRO',
      emailInvitations: 'fake@axample.net',
      createdBy: 4,
    };

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateOrganizations.resolves([
      domainBuilder.buildOrganization(firstOrganization),
      domainBuilder.buildOrganization(secondOrganization),
    ]);

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    expect(targetProfileShareRepository.batchAddTargetProfilesToOrganization).to.be.calledWith([
      { organizationId: 1, targetProfileId: '123' },
      { organizationId: 1, targetProfileId: '765' },
      { organizationId: 2, targetProfileId: '765' },
    ]);
  });

  it('should add existing data protection officer', async function () {
    // given
    const firstOrganization = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'Tag1',
      targetProfiles: '123_765',
      type: 'PRO',
      emailInvitations: 'fake@axample.net',
      createdBy: 4,
      DPOFirstName: 'Djamal',
      DPOLastName: 'Dormi',
      DPOEmail: 'test@example.net',
    };
    const secondOrganization = {
      id: 2,
      name: 'organization B',
      externalId: 'externalId B',
      tags: 'Tag1_Tag2',
      targetProfiles: '765',
      type: 'PRO',
      emailInvitations: 'fake@axample.net',
      createdBy: 4,
    };

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateOrganizations.resolves([
      domainBuilder.buildOrganization(firstOrganization),
      domainBuilder.buildOrganization(secondOrganization),
    ]);

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    expect(dataProtectionOfficerRepository.batchAddDataProtectionOfficerToOrganization).to.be.calledWith([
      { organizationId: 1, firstName: 'Djamal', lastName: 'Dormi', email: 'test@example.net' },
    ]);
  });

  it('should create invitation for organizations with email and role', async function () {
    // given
    const firstOrganizationWithAdminRole = {
      id: 1,
      name: 'organization A',
      externalId: 'externalId A',
      tags: 'Tag1',
      targetProfiles: '123_765',
      emailInvitations: 'organizationA@example.net',
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
      targetProfiles: '123',
      emailInvitations: 'organizationB@example.net',
      organizationInvitationRole: Membership.roles.MEMBER,
      type: 'PRO',
      createdBy: 4,
    };

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateOrganizations.resolves([
      domainBuilder.buildOrganization(firstOrganizationWithAdminRole),
      domainBuilder.buildOrganization(secondOrganizationWithMemberRole),
    ]);

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [firstOrganizationWithAdminRole, secondOrganizationWithMemberRole],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    expect(organizationInvitationService.createProOrganizationInvitation).to.have.been.calledWith({
      organizationRepository: organizationRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationId: firstOrganizationWithAdminRole.id,
      name: firstOrganizationWithAdminRole.name,
      email: firstOrganizationWithAdminRole.emailInvitations,
      role: firstOrganizationWithAdminRole.organizationInvitationRole,
      locale: firstOrganizationWithAdminRole.locale,
    });
    expect(organizationInvitationService.createProOrganizationInvitation).to.have.been.calledWith({
      organizationRepository: organizationRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationId: secondOrganizationWithMemberRole.id,
      name: secondOrganizationWithMemberRole.name,
      email: secondOrganizationWithMemberRole.emailInvitations,
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
      targetProfiles: '123_765',
      emailInvitations: null,
      type: 'PRO',
      createdBy: 4,
    };

    organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
    tagRepositoryStub.findAll.resolves(allTags);
    organizationRepositoryStub.batchCreateOrganizations.resolves([
      domainBuilder.buildOrganization(organizationWithoutEmail),
    ]);

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [organizationWithoutEmail],
      organizationRepository: organizationRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    expect(organizationInvitationService.createProOrganizationInvitation).to.not.have.been.called;
  });

  context('when an organization already exists in database', function () {
    it('should throw an error', async function () {
      // given

      const organizations = [
        { externalId: 'Ab1234', name: 'fake', emailInvitations: 'fake@axample.net', createdBy: 4 },
        { externalId: 'Cd456', name: 'fake', emailInvitations: 'fake@axample.net', createdBy: 4 },
      ];
      organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([
        { id: '1', externalId: 'Ab1234' },
        { id: '2', externalId: 'Cd456' },
      ]);

      // when
      const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
        organizations,
        organizationRepository: organizationRepositoryStub,
        organizationValidator,
        organizationInvitationService,
      });

      // then
      expect(error).to.be.an.instanceOf(OrganizationAlreadyExistError);
      expect(error.message).to.equal('Les organisations avec les externalIds suivants : Ab1234, Cd456 existent déjà.');
    });
  });
});
