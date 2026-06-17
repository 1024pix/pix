import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import {
  COURSE_ITEM_TYPES,
  CourseItem,
} from '../../../../../src/quest/domain/models/combined-courses/value-objects/CourseItem.js';
import * as courseRepository from '../../../../../src/quest/infrastructure/repositories/course-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Repository | course-repository', function () {
  describe('#findByOrganizationId', function () {
    it('returns blueprints shared with the organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const questId = databaseBuilder.factory.buildQuest({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId }).toDTO()],
      }).id;
      const blueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId, name: 'BleuImprimer' });
      databaseBuilder.factory.buildCombinedCourseBlueprintShare({
        organizationId,
        combinedCourseBlueprintId: blueprint.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId });

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.be.instanceOf(CourseItem);
      expect(result[0].id).to.equal(blueprint.id);
      expect(result[0].name).to.equal('BleuImprimer');
      expect(result[0].type).to.equal(COURSE_ITEM_TYPES.BLUEPRINT);
    });

    it('aggregates tubes from all target profiles in the blueprint quest as nbTubes', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const targetProfileId1 = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId1, tubeId: 'tube1' });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId1, tubeId: 'tube2' });

      const targetProfileId2 = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId2, tubeId: 'tube3' });

      const questId = databaseBuilder.factory.buildQuest({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: targetProfileId1 }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: targetProfileId2 }).toDTO(),
        ],
      }).id;

      const blueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId });
      databaseBuilder.factory.buildCombinedCourseBlueprintShare({
        organizationId,
        combinedCourseBlueprintId: blueprint.id,
      });

      const learningContent = {
        tubes: [
          { id: 'tube1', competenceId: 'recComp1' },
          { id: 'tube2', competenceId: 'recComp1' },
          { id: 'tube3', competenceId: 'recComp2' },
        ],
        competences: [
          { id: 'recComp1', areaId: 'recArea1', name_i18n: { fr: 'Comp1' }, index: '1.1', origin: 'Pix' },
          { id: 'recComp2', areaId: 'recArea1', name_i18n: { fr: 'Comp2' }, index: '1.2', origin: 'Pix' },
        ],
        areas: [{ id: 'recArea1', title_i18n: { fr: 'Area1' }, competenceIds: ['recComp1', 'recComp2'] }],
      };
      databaseBuilder.factory.learningContent.build(learningContent);

      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId });

      // then
      expect(result[0].nbTubes).to.equal(3);
    });

    it('counts passages requirements in the quest as nbModules for blueprints', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const questId = databaseBuilder.factory.buildQuest({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: 'module-abc' }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: 'module-def' }).toDTO(),
        ],
      }).id;
      const blueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId });
      databaseBuilder.factory.buildCombinedCourseBlueprintShare({
        organizationId,
        combinedCourseBlueprintId: blueprint.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId });

      // then
      expect(result[0].nbModules).to.equal(2);
    });

    it('returns target profiles shared with the organization via target-profile-shares', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile({
        name: 'Profil partagé',
        category: 'SUBJECT',
        isSimplifiedAccess: false,
      }).id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tube1' });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tube2' });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

      const learningContent = {
        tubes: [
          { id: 'tube1', competenceId: 'recComp1' },
          { id: 'tube2', competenceId: 'recComp1' },
        ],
        competences: [{ id: 'recComp1', areaId: 'recArea1', name_i18n: { fr: 'Comp1' }, index: '1.1', origin: 'Pix' }],
        areas: [{ id: 'recArea1', title_i18n: { fr: 'Area1' }, competenceIds: ['recComp1'] }],
      };
      databaseBuilder.factory.learningContent.build(learningContent);

      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId });

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0]).to.be.instanceOf(CourseItem);
      expect(result[0].id).to.equal(targetProfileId);
      expect(result[0].name).to.equal('Profil partagé');
      expect(result[0].type).to.equal(COURSE_ITEM_TYPES.TARGET_PROFILE);
      expect(result[0].nbTubes).to.equal(2);
      expect(result[0].category).to.equal('SUBJECT');
      expect(result[0].isSimplifiedAccess).to.equal(false);
    });

    it('resolves areas with nested competences from learning content for a TARGET_PROFILE item', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1' });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

      const learningContent = {
        areas: [
          { id: 'recAreaA', code: '1', title_i18n: { fr: 'Information et données' }, competenceIds: ['recCompA'] },
        ],
        competences: [
          { id: 'recCompA', name_i18n: { fr: 'Mener une recherche' }, areaId: 'recAreaA', index: '1.1', origin: 'Pix' },
        ],
        tubes: [{ id: 'recTube1', competenceId: 'recCompA' }],
      };
      databaseBuilder.factory.learningContent.build(learningContent);

      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId, locale: 'fr' });

      // then
      expect(result[0].areas).to.deep.equal([
        {
          id: 'recAreaA',
          code: '1',
          title: 'Information et données',
          color: 'color Domaine A',
          competences: [{ id: 'recCompA', name: 'Mener une recherche', index: '1.1' }],
        },
      ]);
    });

    it('resolves areas with nested competences aggregated from all target profiles in the quest for a BLUEPRINT item', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId1 = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId1, tubeId: 'recTube1' });
      const targetProfileId2 = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId2, tubeId: 'recTube2' });
      const questId = databaseBuilder.factory.buildQuest({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: targetProfileId1 }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: targetProfileId2 }).toDTO(),
        ],
      }).id;
      const blueprint = databaseBuilder.factory.buildCombinedCourseBlueprint({ questId });
      databaseBuilder.factory.buildCombinedCourseBlueprintShare({
        organizationId,
        combinedCourseBlueprintId: blueprint.id,
      });

      const learningContent = {
        areas: [
          { id: 'recAreaA', code: '1', title_i18n: { fr: 'Information et données' }, competenceIds: ['recCompA'] },
          {
            id: 'recAreaB',
            code: '2',
            title_i18n: { fr: 'Communication et collaboration' },
            competenceIds: ['recCompB'],
          },
        ],
        competences: [
          { id: 'recCompA', name_i18n: { fr: 'Mener une recherche' }, areaId: 'recAreaA', index: '1.1', origin: 'Pix' },
          { id: 'recCompB', name_i18n: { fr: 'Interagir' }, areaId: 'recAreaB', index: '2.1', origin: 'Pix' },
        ],
        tubes: [
          { id: 'recTube1', competenceId: 'recCompA' },
          { id: 'recTube2', competenceId: 'recCompB' },
        ],
      };
      databaseBuilder.factory.learningContent.build(learningContent);

      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId, locale: 'fr' });

      // then
      expect(result[0].areas).to.deep.equal([
        {
          id: 'recAreaA',
          code: '1',
          title: 'Information et données',
          color: 'color Domaine A',
          competences: [{ id: 'recCompA', name: 'Mener une recherche', index: '1.1' }],
        },
        {
          id: 'recAreaB',
          code: '2',
          title: 'Communication et collaboration',
          color: 'color Domaine A',
          competences: [{ id: 'recCompB', name: 'Interagir', index: '2.1' }],
        },
      ]);
    });

    it('sorts areas by code and competences by index', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1' });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube2' });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube3' });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });

      const learningContent = {
        areas: [
          { id: 'recAreaB', code: '2', title_i18n: { fr: 'Communication' }, competenceIds: ['recCompB'] },
          { id: 'recAreaA', code: '1', title_i18n: { fr: 'Information' }, competenceIds: ['recCompA1', 'recCompA2'] },
        ],
        competences: [
          { id: 'recCompA2', name_i18n: { fr: 'Gérer des données' }, areaId: 'recAreaA', index: '1.2', origin: 'Pix' },
          {
            id: 'recCompA1',
            name_i18n: { fr: 'Mener une recherche' },
            areaId: 'recAreaA',
            index: '1.1',
            origin: 'Pix',
          },
          { id: 'recCompB', name_i18n: { fr: 'Interagir' }, areaId: 'recAreaB', index: '2.1', origin: 'Pix' },
        ],
        tubes: [
          { id: 'recTube1', competenceId: 'recCompA2' },
          { id: 'recTube2', competenceId: 'recCompA1' },
          { id: 'recTube3', competenceId: 'recCompB' },
        ],
      };
      databaseBuilder.factory.learningContent.build(learningContent);

      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId, locale: 'fr' });

      // then
      expect(result[0].areas[0].code).to.equal('1');
      expect(result[0].areas[0].competences[0].index).to.equal('1.1');
      expect(result[0].areas[0].competences[1].index).to.equal('1.2');
      expect(result[0].areas[1].code).to.equal('2');
    });

    it('does not return target profiles not shared with the organizations', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: otherOrganizationId });
      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId });

      // then
      expect(result).to.have.lengthOf(0);
    });

    it('does not return blueprints not shared with the organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCombinedCourseBlueprint();
      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId });

      // then
      expect(result).to.have.lengthOf(0);
    });

    it('returns items sorted by name ascending then createdAt descending', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const now = new Date();
      const earlier = new Date(now.getTime() - 10000);

      const targetProfileZebre = databaseBuilder.factory.buildTargetProfile({ name: 'Zoulou', createdAt: now }).id;
      const targetProfileAlphaEarlier = databaseBuilder.factory.buildTargetProfile({
        name: 'Alpha',
        createdAt: earlier,
      }).id;
      const targetProfileAlphaNow = databaseBuilder.factory.buildTargetProfile({ name: 'Alpha', createdAt: now }).id;

      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileZebre, organizationId });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileAlphaEarlier, organizationId });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfileAlphaNow, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await courseRepository.findByOrganizationId({ organizationId });

      // then
      expect(result).to.have.lengthOf(3);
      expect(result[0].name).to.equal('Alpha');
      expect(result[0].createdAt.getTime()).to.equal(now.getTime());
      expect(result[1].name).to.equal('Alpha');
      expect(result[1].createdAt.getTime()).to.equal(earlier.getTime());
      expect(result[2].name).to.equal('Zoulou');
    });
  });
});
