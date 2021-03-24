const { sinon, databaseBuilder, expect, domainBuilder } = require('../../../test-helper');
const BookshelfTargetProfile = require('../../../../lib/infrastructure/data/target-profile');
const BookshelfTargetProfileShare = require('../../../../lib/infrastructure/data/target-profile-share');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const targetProfileAdapter = require('../../../../lib/infrastructure/adapters/target-profile-adapter');

describe('Unit | Infrastructure | Adapter | targetSkillAdapter', function() {

  it('should adapt TargetProfile object to domain', function() {
    // given
    const bookshelfTargetProfile = new BookshelfTargetProfile(databaseBuilder.factory.buildTargetProfile());
    const organizationWhichShared = new BookshelfTargetProfileShare(databaseBuilder.factory.buildTargetProfileShare());
    bookshelfTargetProfile.related = sinon.stub().onCall('sharedWithOrganizations').resolves([ organizationWhichShared ]);
    const skillLearningContentDataObject = domainBuilder.buildSkillLearningContentDataObject();
    const associatedSkillDatasourceObjects = [skillLearningContentDataObject];
    const skill = domainBuilder.buildSkill({
      id: skillLearningContentDataObject.id,
      name: skillLearningContentDataObject.name,
      pixValue: skillLearningContentDataObject.pixValue,
      competenceId: skillLearningContentDataObject.competenceId,
      tutorialIds: ['recCO0X22abcdefgh'],
      tubeId: skillLearningContentDataObject.tubeId,
    });
    const expectedTargetProfile = domainBuilder.buildTargetProfile({
      id: bookshelfTargetProfile.get('id'),
      name: bookshelfTargetProfile.get('name'),
      imageUrl: bookshelfTargetProfile.get('imageUrl'),
      isPublic: Boolean(bookshelfTargetProfile.get('isPublic')),
      isSimplifiedAccess: Boolean(bookshelfTargetProfile.get('isSimplifiedAccess')),
      ownerOrganizationId: bookshelfTargetProfile.get('ownerOrganizationId'),
      skills: [skill],
      sharedWithOrganizationIds: [organizationWhichShared.get('organizationId')],
    });

    // when
    const targetProfile = targetProfileAdapter.fromDatasourceObjects({
      bookshelfTargetProfile,
      associatedSkillDatasourceObjects,
    });

    // then
    expect(targetProfile).to.be.an.instanceOf(TargetProfile);
    expect(targetProfile).to.be.deep.equal(expectedTargetProfile);
  });

});
