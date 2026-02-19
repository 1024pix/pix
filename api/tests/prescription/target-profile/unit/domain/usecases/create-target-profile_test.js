import { createTargetProfile } from '../../../../../../src/prescription/target-profile/domain/usecases/create-target-profile.js';
import { categories } from '../../../../../../src/shared/domain/models/TargetProfile.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | create-target-profile', function () {
  let targetProfileAdministrationRepositoryStub;
  let organizationRepositoryStub;

  beforeEach(function () {
    targetProfileAdministrationRepositoryStub = {
      create: sinon.stub(),
    };
    organizationRepositoryStub = {
      get: sinon.stub(),
    };
  });

  it('should create target profile with tubes by passing over creation command', async function () {
    // given
    organizationRepositoryStub.get.resolves();

    const expectedTargetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
      name: 'myFirstTargetProfile',
      internalName: 'myFirstInternalTargetProfile',
      category: categories.SUBJECT,
      description: 'la description',
      comment: 'le commentaire',
      imageUrl: 'mon-image/stylée',
      tubes: [{ id: 'tubeId', level: 2 }],
    });
    targetProfileAdministrationRepositoryStub.create.resolves();

    // when
    const targetProfileCreationCommand = {
      name: 'myFirstTargetProfile',
      internalName: 'myFirstInternalTargetProfile',
      category: categories.SUBJECT,
      description: 'la description',
      comment: 'le commentaire',
      imageUrl: 'mon-image/stylée',
      tubes: [{ id: 'tubeId', level: 2 }],
      areKnowledgeElementsResettable: false,
    };
    await createTargetProfile({
      targetProfileCreationCommand,
      targetProfileAdministrationRepository: targetProfileAdministrationRepositoryStub,
      organizationRepository: organizationRepositoryStub,
    });

    // then
    expect(targetProfileAdministrationRepositoryStub.create).to.have.been.calledWithExactly({
      targetProfileForCreation: expectedTargetProfileForCreation,
    });
  });

  it('should return the created target profile ID', async function () {
    // given
    organizationRepositoryStub.get.resolves();

    const expectedTargetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
      name: 'myFirstTargetProfile',
      internalName: 'myFirstTargetProfileInternal',
      category: categories.SUBJECT,
      description: 'la description',
      comment: 'le commentaire',
      imageUrl: 'mon-image/stylée',
      tubes: [{ id: 'tubeId', level: 2 }],
    });
    targetProfileAdministrationRepositoryStub.create
      .withArgs({
        targetProfileForCreation: expectedTargetProfileForCreation,
      })
      .resolves(123);

    // when
    const targetProfileCreationCommand = {
      name: 'myFirstTargetProfile',
      internalName: 'myFirstTargetProfileInternal',
      category: categories.SUBJECT,
      description: 'la description',
      comment: 'le commentaire',
      imageUrl: 'mon-image/stylée',
      tubes: [{ id: 'tubeId', level: 2 }],
      areKnowledgeElementsResettable: false,
    };
    const targetProfileId = await createTargetProfile({
      targetProfileCreationCommand,
      targetProfileAdministrationRepository: targetProfileAdministrationRepositoryStub,
      organizationRepository: organizationRepositoryStub,
    });

    // then
    expect(targetProfileId).to.equal(123);
  });
});
