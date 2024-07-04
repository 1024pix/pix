// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import { PGSQL_FOREIGN_KEY_VIOLATION_ERROR } from '../../../../db/pgsql-errors.js';
import { ObjectValidationError, OrganizationTagNotFound } from '../../../../lib/domain/errors.js';
import { OrganizationForAdmin } from '../../../../lib/domain/models/index.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { OrganizationTag } from '../../../../lib/domain/models/OrganizationTag.js';
import { createOrganizationsWithTagsAndTargetProfiles } from '../../../../lib/domain/usecases/create-organizations-with-tags-and-target-profiles.js';
import { DomainTransaction as domainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { monitoringTools } from '../../../../lib/infrastructure/monitoring-tools.js';
import { InvalidInputDataError } from '../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | create-organizations-with-tags-and-target-profiles', function () {
  let organizationRepositoryStub;
  let organizationForAdminRepositoryStub;
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
    };
    organizationForAdminRepositoryStub = {
      save: sinon.stub(),
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
    sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
  });

  context('#errors', function () {
    context('when parameter "organizations" is undefined', function () {
      it('throws an ObjectValidationError', async function () {
        // given
        const organizations = undefined;

        // when
        const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({ organizations });

        // then
        expect(error).to.be.an.instanceOf(ObjectValidationError);
        expect(error.message).to.be.equals('Les organisations ne sont pas renseignées.');
      });
    });

    context('when organization tags does not exists', function () {
      it('throws an error', async function () {
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
        organizationForAdminRepositoryStub.save
          .onFirstCall()
          .resolves(domainBuilder.buildOrganization(firstOrganization))
          .onSecondCall()
          .resolves(domainBuilder.buildOrganization(secondOrganization));

        // when
        const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
          domainTransaction,
          organizations: [firstOrganization, secondOrganization],
          organizationRepository: organizationRepositoryStub,
          organizationForAdminRepository: organizationForAdminRepositoryStub,
          tagRepository: tagRepositoryStub,
          organizationTagRepository: organizationTagRepositoryStub,
          dataProtectionOfficerRepository,
          organizationValidator,
          organizationInvitationService,
        });

        // then
        expect(error).to.be.instanceOf(OrganizationTagNotFound);
        expect(error.message).to.be.equal("Le tag TagNotFound de l'organisation organization A n'existe pas.");
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWith({
          message: `Le tag TagNotFound de l'organisation organization A n'existe pas.`,
          context: 'create-organizations-with-tags-and-target-profiles',
          error: { name: 'OrganizationTagNotFound' },
          event: 'add-organizations-tags',
          team: 'acces',
        });
      });
    });

    context('when organization "createdBy" user id does not exist', function () {
      it('throws an error', async function () {
        // given
        const firstOrganization = {
          id: 1,
          name: 'organization A',
          externalId: 'externalId A',
          tags: 'TagNotFound',
          targetProfiles: '123',
          type: 'PRO',
          emailInvitations: 'fake@axample.net',
          createdBy: 9912375,
        };
        const errorThrownMessage = `/* path: /api/admin/organizations/import-csv */ insert into "organizations" ("createdBy", "credit", "documentationUrl", "email", "externalId", "identityProviderForCampaigns", "isManagingStudents", "name", "provinceCode", "type") values ($1, $2, $3, DEFAULT, $4, $5, $6, $7, $8, $9) returning * - insert or update on table "organizations" violates foreign key constraint "organizations_createdby_foreign"`;
        const errorThrown = new Error(errorThrownMessage);
        errorThrown.code = PGSQL_FOREIGN_KEY_VIOLATION_ERROR;
        errorThrown.detail = 'Key (createdBy)=(990000) is not present in table "users".';

        organizationRepositoryStub.findByExternalIdsFetchingIdsOnly.resolves([]);
        tagRepositoryStub.findAll.resolves(allTags);
        organizationForAdminRepositoryStub.save.rejects(errorThrown);

        // when
        const error = await catchErr(createOrganizationsWithTagsAndTargetProfiles)({
          domainTransaction,
          organizations: [firstOrganization],
          organizationRepository: organizationRepositoryStub,
          organizationForAdminRepository: organizationForAdminRepositoryStub,
          tagRepository: tagRepositoryStub,
          organizationTagRepository: organizationTagRepositoryStub,
          dataProtectionOfficerRepository,
          organizationValidator,
          organizationInvitationService,
        });

        // then
        expect(error).to.be.instanceOf(InvalidInputDataError);
        expect(error.message).to.be.equal('User with ID "990000" does not exist');
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWith({
          message: errorThrownMessage,
          context: 'create-organizations-with-tags-and-target-profiles',
          error: { name: 'Error' },
          event: 'create-organizations',
          team: 'acces',
        });
      });
    });
  });

  it('validates organization data before trying to create organizations', async function () {
    // given
    const organization = {
      name: '',
      externalId: 'AB1234',
      emailInvitations: 'fake@axample.net',
      createdBy: 4,
      tags: 'tag1_tag2',
      targetProfiles: '123',
    };
    const organizations = [organization];

    // when
    tagRepositoryStub.findAll.resolves(allTags);
    organizationForAdminRepositoryStub.save.resolves(domainBuilder.buildOrganization(organization));

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: organizations,
      organizationRepository: organizationRepositoryStub,
      organizationForAdminRepository: organizationForAdminRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    expect(organizationValidator.validate).to.have.been.calledWithExactly(organizations[0]);
  });

  it('adds organizations into database ignoring the email for SCO activation for the PRO organization', async function () {
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

    const expectedProOrganizationToInsert = [
      {
        organization: organizationPROToCreate,
        tags: organizationPRO.tags?.split('_') ?? [],
        targetProfiles: organizationPRO.targetProfiles?.split('_') ?? [],
        role: undefined,
        dataProtectionOfficer: {
          email: undefined,
          firstName: undefined,
          lastName: undefined,
        },
        emailInvitations: organizationPRO.emailInvitations,
        locale: undefined,
      },
      {
        organization: organizationSCOToCreate,
        tags: organizationSCO.tags?.split('_') ?? [],
        targetProfiles: organizationSCO.targetProfiles?.split('_') ?? [],
        role: undefined,
        dataProtectionOfficer: {
          email: undefined,
          firstName: undefined,
          lastName: undefined,
        },
        emailInvitations: organizationSCO.emailInvitations,
        locale: undefined,
      },
    ];
    tagRepositoryStub.findAll.resolves(allTags);
    organizationForAdminRepositoryStub.save
      .onFirstCall()
      .resolves(organizationPROToCreate)
      .onSecondCall()
      .resolves(organizationSCOToCreate);

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [organizationPRO, organizationSCO],
      organizationRepository: organizationRepositoryStub,
      organizationForAdminRepository: organizationForAdminRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    const organizationsToCreate = [
      organizationForAdminRepositoryStub.save.getCall(0).args[0],
      organizationForAdminRepositoryStub.save.getCall(1).args[0],
    ];
    expect(organizationsToCreate).to.deep.equal(
      expectedProOrganizationToInsert.map(({ organization }) => organization),
    );
  });

  it('adds organization tags', async function () {
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
    organizationForAdminRepositoryStub.save
      .onFirstCall()
      .resolves(firstOrganization)
      .onSecondCall()
      .resolves(secondOrganization);

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      organizationForAdminRepository: organizationForAdminRepositoryStub,
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

  it('adds organization target profiles', async function () {
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
    organizationForAdminRepositoryStub.save
      .onFirstCall()
      .resolves(domainBuilder.buildOrganization(firstOrganization))
      .onSecondCall()
      .resolves(domainBuilder.buildOrganization(secondOrganization));

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      organizationForAdminRepository: organizationForAdminRepositoryStub,
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

  it('adds a data protection officer', async function () {
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
    organizationForAdminRepositoryStub.save
      .onFirstCall()
      .resolves(domainBuilder.buildOrganization(firstOrganization))
      .onSecondCall()
      .resolves(domainBuilder.buildOrganization(secondOrganization));

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [firstOrganization, secondOrganization],
      organizationRepository: organizationRepositoryStub,
      organizationForAdminRepository: organizationForAdminRepositoryStub,
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

  it('creates an invitation for organizations with email and role', async function () {
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
    organizationForAdminRepositoryStub.save
      .onFirstCall()
      .resolves(domainBuilder.buildOrganization(firstOrganizationWithAdminRole))
      .onSecondCall()
      .resolves(domainBuilder.buildOrganization(secondOrganizationWithMemberRole));

    // when
    await createOrganizationsWithTagsAndTargetProfiles({
      domainTransaction,
      organizations: [firstOrganizationWithAdminRole, secondOrganizationWithMemberRole],
      organizationRepository: organizationRepositoryStub,
      organizationForAdminRepository: organizationForAdminRepositoryStub,
      tagRepository: tagRepositoryStub,
      targetProfileShareRepository,
      organizationTagRepository: organizationTagRepositoryStub,
      dataProtectionOfficerRepository,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationValidator,
      organizationInvitationService,
    });

    // then
    expect(organizationInvitationService.createProOrganizationInvitation).to.have.been.calledWithExactly({
      organizationRepository: organizationRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationId: firstOrganizationWithAdminRole.id,
      name: firstOrganizationWithAdminRole.name,
      email: firstOrganizationWithAdminRole.emailInvitations,
      role: firstOrganizationWithAdminRole.organizationInvitationRole,
      locale: firstOrganizationWithAdminRole.locale,
    });
    expect(organizationInvitationService.createProOrganizationInvitation).to.have.been.calledWithExactly({
      organizationRepository: organizationRepositoryStub,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
      organizationId: secondOrganizationWithMemberRole.id,
      name: secondOrganizationWithMemberRole.name,
      email: secondOrganizationWithMemberRole.emailInvitations,
      role: secondOrganizationWithMemberRole.organizationInvitationRole,
      locale: secondOrganizationWithMemberRole.locale,
    });
  });

  context('when organization email is empty', function () {
    it('creates an invitation', async function () {
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
      organizationForAdminRepositoryStub.save.resolves(domainBuilder.buildOrganization(organizationWithoutEmail));

      // when
      await createOrganizationsWithTagsAndTargetProfiles({
        domainTransaction,
        organizations: [organizationWithoutEmail],
        organizationRepository: organizationRepositoryStub,
        organizationForAdminRepository: organizationForAdminRepositoryStub,
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
  });
});
