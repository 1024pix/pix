import * as skillsApi from '../../../../../src/learning-content/application/api/skills-api.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('LearningContent | Integration | Application | API | skills', function () {
  const skillData00 = {
    id: 'skillId00',
    name: 'name Acquis 0',
    status: 'actif',
    pixValue: 2.9,
    version: 5,
    level: 2,
    hintStatus: 'hintStatus Acquis 0',
    competenceId: 'competenceIdA',
    tubeId: 'tubeIdA',
    tutorialIds: ['tutorialIdA'],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId00', en: 'hint EN skillId00' },
  };
  const skillData01 = {
    id: 'skillId01',
    name: 'name Acquis 1',
    status: 'archivé',
    pixValue: 4.2,
    version: 8,
    level: 3,
    hintStatus: 'hintStatus Acquis 1',
    competenceId: 'competenceIdA',
    tubeId: 'tubeIdA',
    tutorialIds: ['tutorialIdA'],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId01', en: 'hint EN skillId01' },
  };
  const skillData02 = {
    id: 'skillId02',
    name: 'name Acquis 2',
    status: 'périmé',
    pixValue: 5.1,
    version: 9,
    level: 1,
    hintStatus: 'hintStatus Acquis 2',
    competenceId: 'competenceIdA',
    tubeId: 'tubeIdA',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId02', en: 'hint EN skillId02' },
  };

  beforeEach(async function () {
    databaseBuilder.factory.learningContent.build({
      skills: [skillData00, skillData01, skillData02],
    });
    await databaseBuilder.commit();
  });

  describe('#findInIds', function () {
    context('when an empty or nullish array is given', function () {
      it('should return an empty array', async function () {
        const emptySkills = await skillsApi.findInIds({ ids: [] });
        const undefinedSkills = await skillsApi.findInIds({});
        const nullishSkills = await skillsApi.findInIds({ ids: null });

        expect(emptySkills).to.deep.equal([]);
        expect(undefinedSkills).to.deep.equal([]);
        expect(nullishSkills).to.deep.equal([]);
      });
    });

    context('when skills are missing for given ids', function () {
      it('should throw a NotFoundError', async function () {
        const err = await catchErr(skillsApi.findInIds)({ ids: ['skillId00', 'skillIdFOO'] });

        expect(err).to.deepEqualInstance(new NotFoundError('Acquis introuvable'));
      });
    });

    context('when all skills exist in given ids', function () {
      it('should return skills', async function () {
        const baseSkills = await skillsApi.findInIds({ ids: ['skillId01', 'skillId02', 'skillId00'] });

        expect(baseSkills).to.deepEqualArray([
          domainBuilder.learningContent.buildBaseSkill(skillData01),
          domainBuilder.learningContent.buildBaseSkill(skillData02),
          domainBuilder.learningContent.buildBaseSkill(skillData00),
        ]);
      });
    });
  });
});
