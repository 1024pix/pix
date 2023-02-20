import { sinon, databaseBuilder, expect, domainBuilder } from '../../../test-helper';
import BookshelfTargetProfile from '../../../../lib/infrastructure/orm-models/TargetProfile';
import BookshelfTargetProfileShare from '../../../../lib/infrastructure/orm-models/TargetProfileShare';
import TargetProfile from '../../../../lib/domain/models/TargetProfile';
import targetProfileAdapter from '../../../../lib/infrastructure/adapters/target-profile-adapter';

describe('Unit | Infrastructure | Adapter | targetProfileAdapter', function () {
  it('should adapt TargetProfile object to domain', function () {
    // given
    const bookshelfTargetProfile = new BookshelfTargetProfile(databaseBuilder.factory.buildTargetProfile());
    const organizationWhichShared = new BookshelfTargetProfileShare(databaseBuilder.factory.buildTargetProfileShare());
    bookshelfTargetProfile.related = sinon.stub().onCall('sharedWithOrganizations').resolves([organizationWhichShared]);
    const skillLearningContentDataObject = domainBuilder.buildSkillLearningContentDataObject({
      name: '@coucou',
      level: 3,
    });
    const associatedSkillDatasourceObjects = [skillLearningContentDataObject];
    const skill = domainBuilder.buildSkill({
      id: skillLearningContentDataObject.id,
      name: skillLearningContentDataObject.name,
      pixValue: skillLearningContentDataObject.pixValue,
      competenceId: skillLearningContentDataObject.competenceId,
      tutorialIds: ['recCO0X22abcdefgh'],
      tubeId: skillLearningContentDataObject.tubeId,
      difficulty: skillLearningContentDataObject.level,
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
