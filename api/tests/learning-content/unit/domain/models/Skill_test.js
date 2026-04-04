import { domainBuilder, expect } from '../../../../test-helper.js';

describe('LearningContent | Unit | Domain | Models | Skill', function () {
  const baseDto = {
    id: 'skillId00',
    name: 'name skillId00',
    pixValue: 1,
    version: 2,
    level: 3,
    status: 'status skillId00',
    hintStatus: 'hintStatus skillId00',
    hint_i18n: { fr: 'fr hint', en: 'en hint' },
    competenceId: 'competenceId00',
    tubeId: 'tubeId00',
    tutorialIds: ['tutorialId00'],
    learningMoreTutorialIds: ['learningMoreTutorialId00'],
  };

  describe('getters', function () {
    it('getters return expected value', function () {
      const skill = domainBuilder.learningContent.buildSkill(baseDto);

      expect(skill.id).to.equal(baseDto.id);
      expect(skill.name).to.equal(baseDto.name);
      expect(skill.pixValue).to.equal(baseDto.pixValue);
      expect(skill.version).to.equal(baseDto.version);
      expect(skill.level).to.equal(baseDto.level);
      expect(skill.status).to.equal(baseDto.status);
      expect(skill.hintStatus).to.equal(baseDto.hintStatus);
      expect(skill.hint_i18n).to.deep.equal(baseDto.hint_i18n);
      expect(skill.competenceId).to.equal(baseDto.competenceId);
      expect(skill.tubeId).to.equal(baseDto.tubeId);
      expect(skill.tutorialIds).to.deep.equal(baseDto.tutorialIds);
      expect(skill.learningMoreTutorialIds).to.deep.equal(baseDto.learningMoreTutorialIds);
    });

    it('returns null for tutorialIds when base tutorialIds is null', function () {
      const skill = domainBuilder.learningContent.buildSkill({
        ...baseDto,
        tutorialIds: null,
      });

      expect(skill.tutorialIds).to.be.null;
    });

    it('returns null for learningMoreTutorialIds when base learningMoreTutorialIds is null', function () {
      const skill = domainBuilder.learningContent.buildSkill({
        ...baseDto,
        learningMoreTutorialIds: null,
      });

      expect(skill.learningMoreTutorialIds).to.be.null;
    });
  });

  describe('proxy behaviour', function () {
    it('cannot set values', function () {
      const skill = domainBuilder.learningContent.buildSkill(baseDto);

      const props = [
        'id',
        'name',
        'pixValue',
        'version',
        'level',
        'status',
        'hintStatus',
        'hint_i18n',
        'competenceId',
        'tubeId',
        'tutorialIds',
        'learningMoreTutorialIds',
      ];
      props.forEach((prop) => {
        expect(() => {
          skill[prop] = 'bar';
        }).to.throw(TypeError, new RegExp(`Cannot set property ${prop}`));
      });
    });
  });
});
