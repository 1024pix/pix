const { databaseBuilder, expect, factory } = require('../../../test-helper');
const BookshelfTargetProfile = require('../../../../lib/infrastructure/data/target-profile');
const BookshelfTargetProfileShared = require('../../../../lib/infrastructure/data/target-profile-shared');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const targetProfileAdapter = require('../../../../lib/infrastructure/adapters/target-profile-adapter');

describe('Unit | Infrastructure | Adapter | targetSkillAdapter', () => {

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  it('should adapt TargetSkill object to domain', () => {
    // given
    const bookshelfTargetProfile = new BookshelfTargetProfile(databaseBuilder.factory.buildTargetProfile());
    const skillAirtableDataObject = factory.buildSkillAirtableDataObject();
    const associatedSkillAirtableDataObjects = [skillAirtableDataObject];
    const expectedTargetProfile = factory.buildTargetProfile({
      id: bookshelfTargetProfile.get('id'),
      name: bookshelfTargetProfile.get('name'),
      isPublic: Boolean(bookshelfTargetProfile.get('isPublic')),
      organizationId: bookshelfTargetProfile.get('organizationId'),
      skills: [factory.buildSkill({ id: skillAirtableDataObject.id, name: skillAirtableDataObject.name })],
      organizationsSharedId: [],
    });

    // when
    const targetProfile = targetProfileAdapter.fromDatasourceObjects({
      bookshelfTargetProfile,
      associatedSkillAirtableDataObjects,
    });

    // then
    expect(targetProfile).to.be.an.instanceOf(TargetProfile);
    expect(targetProfile).to.be.deep.equal(expectedTargetProfile);
  });

  it('should adapt TargetSkill object to domain with organizationAccess', () => {
    // given
    const bookshelfTargetProfile = new BookshelfTargetProfile(databaseBuilder.factory.buildTargetProfile());
    const skillAirtableDataObject = factory.buildSkillAirtableDataObject();
    const associatedSkillAirtableDataObjects = [skillAirtableDataObject];
    const expectedTargetProfile = factory.buildTargetProfile({
      id: bookshelfTargetProfile.get('id'),
      name: bookshelfTargetProfile.get('name'),
      isPublic: Boolean(bookshelfTargetProfile.get('isPublic')),
      organizationId: bookshelfTargetProfile.get('organizationId'),
      skills: [factory.buildSkill({ id: skillAirtableDataObject.id, name: skillAirtableDataObject.name })],
      organizationsSharedId: [],
    });

    // when
    const targetProfile = targetProfileAdapter.fromDatasourceObjects({
      bookshelfTargetProfile,
      associatedSkillAirtableDataObjects,
    });

    // then
    expect(targetProfile).to.be.an.instanceOf(TargetProfile);
    expect(targetProfile).to.be.deep.equal(expectedTargetProfile);
  });

  it('should adapt TargetSkill object to domain with organizationShared', () => {
    // given
    const bookshelfTargetProfile = new BookshelfTargetProfile(databaseBuilder.factory.buildTargetProfile());
    const organizationWhichShared = new BookshelfTargetProfileShared(databaseBuilder.factory.buildTargetProfilesShared());
    bookshelfTargetProfile.relations = {
      organizationsWhichShared: [ organizationWhichShared ]
    };
    const skillAirtableDataObject = factory.buildSkillAirtableDataObject();
    const associatedSkillAirtableDataObjects = [skillAirtableDataObject];
    const expectedTargetProfile = factory.buildTargetProfile({
      id: bookshelfTargetProfile.get('id'),
      name: bookshelfTargetProfile.get('name'),
      isPublic: Boolean(bookshelfTargetProfile.get('isPublic')),
      organizationId: bookshelfTargetProfile.get('organizationId'),
      skills: [factory.buildSkill({ id: skillAirtableDataObject.id, name: skillAirtableDataObject.name })],
      organizationsSharedId: [organizationWhichShared.get('organizationId')]
    });

    // when
    const targetProfile = targetProfileAdapter.fromDatasourceObjects({
      bookshelfTargetProfile,
      associatedSkillAirtableDataObjects,
    });

    // then
    expect(targetProfile).to.be.an.instanceOf(TargetProfile);
    expect(targetProfile).to.be.deep.equal(expectedTargetProfile);
  });

});
