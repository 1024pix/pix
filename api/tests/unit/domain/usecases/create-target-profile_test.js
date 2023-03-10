const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const createTargetProfile = require('../../../../lib/domain/usecases/create-target-profile');
const { categories } = require('../../../../lib/domain/models/TargetProfile');
const learningContentConversionService = require('../../../../lib/domain/services/learning-content/learning-content-conversion-service');
const usecases = require('../../../../lib/domain/usecases');
const { TargetProfileCannotBeCreated } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-target-profile', function () {
  let targetProfileRepositoryStub;
  let organizationRepositoryStub;

  beforeEach(function () {
    targetProfileRepositoryStub = {
      createWithTubes: sinon.stub(),
      updateTargetProfileWithSkills: sinon.stub(),
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
    };

    const error = await catchErr(usecases.createTargetProfile)({
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
    sinon.stub(learningContentConversionService, 'findActiveSkillsForCappedTubes');
    learningContentConversionService.findActiveSkillsForCappedTubes.resolves();
    targetProfileRepositoryStub.updateTargetProfileWithSkills.resolves();
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
    targetProfileRepositoryStub.createWithTubes.resolves();

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
    };
    await createTargetProfile({
      targetProfileCreationCommand,
      domainTransaction,
      targetProfileRepository: targetProfileRepositoryStub,
      organizationRepository: organizationRepositoryStub,
    });

    // then
    expect(targetProfileRepositoryStub.createWithTubes).to.have.been.calledWithExactly({
      targetProfileForCreation: expectedTargetProfileForCreation,
      domainTransaction,
    });
  });

  it('should create target profile skills obtained through service', async function () {
    // given
    organizationRepositoryStub.get.resolves();
    const domainTransaction = Symbol('DomainTransaction');
    sinon.stub(learningContentConversionService, 'findActiveSkillsForCappedTubes');
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
    targetProfileRepositoryStub.createWithTubes
      .withArgs({
        targetProfileForCreation: expectedTargetProfileForCreation,
        domainTransaction,
      })
      .resolves(123);
    const someSkills = [domainBuilder.buildSkill()];
    learningContentConversionService.findActiveSkillsForCappedTubes
      .withArgs(expectedTargetProfileForCreation.tubes)
      .resolves(someSkills);
    targetProfileRepositoryStub.updateTargetProfileWithSkills.resolves();

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
    };
    await createTargetProfile({
      targetProfileCreationCommand,
      domainTransaction,
      targetProfileRepository: targetProfileRepositoryStub,
      organizationRepository: organizationRepositoryStub,
    });

    // then
    expect(targetProfileRepositoryStub.updateTargetProfileWithSkills).to.have.been.calledWithExactly({
      targetProfileId: 123,
      skills: someSkills,
      domainTransaction,
    });
  });

  it('should return the created target profile ID', async function () {
    // given
    organizationRepositoryStub.get.resolves();
    const domainTransaction = Symbol('DomainTransaction');
    sinon.stub(learningContentConversionService, 'findActiveSkillsForCappedTubes');
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
    targetProfileRepositoryStub.createWithTubes
      .withArgs({
        targetProfileForCreation: expectedTargetProfileForCreation,
        domainTransaction,
      })
      .resolves(123);
    const someSkills = [domainBuilder.buildSkill()];
    learningContentConversionService.findActiveSkillsForCappedTubes
      .withArgs(expectedTargetProfileForCreation.tubes)
      .resolves(someSkills);
    targetProfileRepositoryStub.updateTargetProfileWithSkills.resolves();

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
