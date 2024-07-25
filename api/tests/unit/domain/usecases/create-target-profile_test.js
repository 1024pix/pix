import { createTargetProfile } from '../../../../lib/domain/usecases/create-target-profile.js';
import { TargetProfileCannotBeCreated } from '../../../../src/shared/domain/errors.js';
import { categories } from '../../../../src/shared/domain/models/TargetProfile.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | create-target-profile', function () {
  let targetProfileRepositoryStub;
  let organizationRepositoryStub;

  beforeEach(function () {
    targetProfileRepositoryStub = {
      create: sinon.stub(),
    };
    organizationRepositoryStub = {
      get: sinon.stub(),
    };
  });

  it('should throw a TargetProfileCannotBeCreated error with non existant owner organization', async function () {
    // given
    const domainTransaction = Symbol('DomainTransaction');
    organizationRepositoryStub.get.rejects(new Error());

    // when
    const targetProfileCreationCommand = {
      name: 'myFirstTargetProfile',
      category: categories.SUBJECT,
      description: 'la description',
      comment: 'le commentaire',
      isPublic: true,
      imageUrl: 'mon-image/stylée',
      ownerOrganizationId: 1,
      tubes: [{ id: 'tubeId', level: 2 }],
      areKnowledgeElementsResettable: false,
    };

    const error = await catchErr(createTargetProfile)({
      targetProfileCreationCommand,
      domainTransaction,
      targetProfileRepository: targetProfileRepositoryStub,
      organizationRepository: organizationRepositoryStub,
    });

    // then
    expect(error).to.be.an.instanceOf(TargetProfileCannotBeCreated);
  });

  it('should create target profile with tubes by passing over creation command', async function () {
    // given
    organizationRepositoryStub.get.resolves();
    const domainTransaction = Symbol('DomainTransaction');
    const expectedTargetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
      name: 'myFirstTargetProfile',
      category: categories.SUBJECT,
      description: 'la description',
      comment: 'le commentaire',
      isPublic: true,
      imageUrl: 'mon-image/stylée',
      ownerOrganizationId: 1,
      tubes: [{ id: 'tubeId', level: 2 }],
    });
    targetProfileRepositoryStub.create.resolves();

    // when
    const targetProfileCreationCommand = {
      name: 'myFirstTargetProfile',
      category: categories.SUBJECT,
      description: 'la description',
      comment: 'le commentaire',
      isPublic: true,
      imageUrl: 'mon-image/stylée',
      ownerOrganizationId: 1,
      tubes: [{ id: 'tubeId', level: 2 }],
      areKnowledgeElementsResettable: false,
    };
    await createTargetProfile({
      targetProfileCreationCommand,
      domainTransaction,
      targetProfileRepository: targetProfileRepositoryStub,
      organizationRepository: organizationRepositoryStub,
    });

    // then
    expect(targetProfileRepositoryStub.create).to.have.been.calledWithExactly({
      targetProfileForCreation: expectedTargetProfileForCreation,
      domainTransaction,
    });
  });

  it('should return the created target profile ID', async function () {
    // given
    organizationRepositoryStub.get.resolves();
    const domainTransaction = Symbol('DomainTransaction');
    const expectedTargetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
      name: 'myFirstTargetProfile',
      category: categories.SUBJECT,
      description: 'la description',
      comment: 'le commentaire',
      isPublic: true,
      imageUrl: 'mon-image/stylée',
      ownerOrganizationId: 1,
      tubes: [{ id: 'tubeId', level: 2 }],
    });
    targetProfileRepositoryStub.create
      .withArgs({
        targetProfileForCreation: expectedTargetProfileForCreation,
        domainTransaction,
      })
      .resolves(123);

    // when
    const targetProfileCreationCommand = {
      name: 'myFirstTargetProfile',
      category: categories.SUBJECT,
      description: 'la description',
      comment: 'le commentaire',
      isPublic: true,
      imageUrl: 'mon-image/stylée',
      ownerOrganizationId: 1,
      tubes: [{ id: 'tubeId', level: 2 }],
      areKnowledgeElementsResettable: false,
    };
    const targetProfileId = await createTargetProfile({
      targetProfileCreationCommand,
      domainTransaction,
      targetProfileRepository: targetProfileRepositoryStub,
      organizationRepository: organizationRepositoryStub,
    });

    // then
    expect(targetProfileId).to.equal(123);
  });
});
