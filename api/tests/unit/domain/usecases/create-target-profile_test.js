import { expect, sinon, domainBuilder } from '../../../test-helper';
import createTargetProfile from '../../../../lib/domain/usecases/create-target-profile';
import { categories } from '../../../../lib/domain/models/TargetProfile';
import learningContentConversionService from '../../../../lib/domain/services/learning-content/learning-content-conversion-service';

describe('Unit | UseCase | create-target-profile', function () {
  let targetProfileRepositoryStub;

  beforeEach(function () {
    targetProfileRepositoryStub = {
      createWithTubes: sinon.stub(),
      updateTargetProfileWithSkills: sinon.stub(),
    };
  });

  it('should create target profile with tubes by passing over creation command', async function () {
    // given
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
    });

    // then
    expect(targetProfileRepositoryStub.createWithTubes).to.have.been.calledWithExactly({
      targetProfileForCreation: expectedTargetProfileForCreation,
      domainTransaction,
    });
  });

  it('should create target profile skills obtained through service', async function () {
    // given
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
    });

    // then
    expect(targetProfileId).to.equal(123);
  });
});
