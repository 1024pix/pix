const { sinon, databaseBuilder, expect, domainBuilder } = require('../../../test-helper');
const BookshelfTargetProfile = require('../../../../lib/infrastructure/data/target-profile');
const BookshelfTargetProfileShare = require('../../../../lib/infrastructure/data/target-profile-share');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const targetProfileAdapter = require('../../../../lib/infrastructure/adapters/target-profile-adapter');

describe('Unit | Infrastructure | Adapter | targetSkillAdapter', () => {

  it('should adapt TargetProfile object to domain', () => {
    // given
    const bookshelfTargetProfile = new BookshelfTargetProfile(databaseBuilder.factory.buildTargetProfile());
    const organizationWhichShared = new BookshelfTargetProfileShare(databaseBuilder.factory.buildTargetProfileShare());
    bookshelfTargetProfile.related = sinon.stub().onCall('sharedWithOrganizations').resolves([ organizationWhichShared ]);
    const skillLearningContentDataObject = domainBuilder.buildSkillLearningContentDataObject();
    const associatedSkillLearningContentDataObjects = [skillLearningContentDataObject];
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
      organizationId: bookshelfTargetProfile.get('organizationId'),
      skills: [skill],
      sharedWithOrganizationIds: [organizationWhichShared.get('organizationId')],
    });

    // when
    const targetProfile = targetProfileAdapter.fromDatasourceObjects({
      bookshelfTargetProfile,
      associatedSkillLearningContentDataObjects,
    });

    // then
    expect(targetProfile).to.be.an.instanceOf(TargetProfile);
    expect(targetProfile).to.be.deep.equal(expectedTargetProfile);
  });

});
