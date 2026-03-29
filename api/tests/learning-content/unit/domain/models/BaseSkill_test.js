import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Learning Content | Unit | Domain | Models | BaseSkill', function () {
  let baseSkillData;

  beforeEach(function () {
    baseSkillData = {
      id: 'skillABC123',
      name: '@fruits2',
      pixValue: 2.5,
      version: 2,
      level: 2,
      status: 'archivé',
      hintStatus: 'pré-validé',
      hint_i18n: { fr: 'indice fr', en: 'indice en' },
      tutorialIds: ['tutorialABC123'],
      learningMoreTutorialIds: ['learningMoreTutorialABC123'],
      tubeId: 'tubeABC123',
      competenceId: 'competenceABC123',
    };
  });

  describe('#get id', function () {
    it('returns id', function () {
      const baseSkill = domainBuilder.learningContent.buildBaseSkill(baseSkillData);

      const id = baseSkill.id;

      expect(id).to.equal(baseSkillData.id);
    });
  });

  describe('#get name', function () {
    it('returns name', function () {
      const baseSkill = domainBuilder.learningContent.buildBaseSkill(baseSkillData);

      const name = baseSkill.name;

      expect(name).to.equal(baseSkillData.name);
    });
  });

  describe('#get pixValue', function () {
    it('returns pixValue', function () {
      const baseSkill = domainBuilder.learningContent.buildBaseSkill(baseSkillData);

      const pixValue = baseSkill.pixValue;

      expect(pixValue).to.equal(baseSkillData.pixValue);
    });
  });

  describe('#get difficulty', function () {
    it('returns difficulty', function () {
      const baseSkill = domainBuilder.learningContent.buildBaseSkill(baseSkillData);

      const difficulty = baseSkill.difficulty;

      expect(difficulty).to.equal(baseSkillData.level);
    });
  });

  describe('#get version', function () {
    it('returns version', function () {
      const baseSkill = domainBuilder.learningContent.buildBaseSkill(baseSkillData);

      const version = baseSkill.version;

      expect(version).to.equal(baseSkillData.version);
    });
  });

  describe('#get status', function () {
    it('returns status', function () {
      const baseSkill = domainBuilder.learningContent.buildBaseSkill(baseSkillData);

      const status = baseSkill.status;

      expect(status).to.equal(baseSkillData.status);
    });
  });

  describe('#get hintStatus', function () {
    it('returns hintStatus', function () {
      const baseSkill = domainBuilder.learningContent.buildBaseSkill(baseSkillData);

      const hintStatus = baseSkill.hintStatus;

      expect(hintStatus).to.equal(baseSkillData.hintStatus);
    });
  });

  describe('#get tutorialIds', function () {
    context('when there are tutorial ids', function () {
      it('returns tutorialIds', function () {
        const baseSkill = domainBuilder.learningContent.buildBaseSkill({
          ...baseSkillData,
          tutorialIds: ['tutorialA', 'tutorialB'],
        });

        const tutorialIds = baseSkill.tutorialIds;

        expect(tutorialIds).to.deep.equal(['tutorialA', 'tutorialB']);
      });
    });

    context('when there are no tutorial ids', function () {
      it('returns null', function () {
        const baseSkill = domainBuilder.learningContent.buildBaseSkill({
          ...baseSkillData,
          tutorialIds: null,
        });

        const tutorialIds = baseSkill.tutorialIds;

        expect(tutorialIds).to.be.null;
      });
    });
  });

  describe('#get learningMoreTutorialIds', function () {
    context('when there are learningMoreTutorial ids', function () {
      it('returns learningMoreTutorialIds', function () {
        const baseSkill = domainBuilder.learningContent.buildBaseSkill({
          ...baseSkillData,
          learningMoreTutorialIds: ['learningMoreTutorialA', 'learningMoreTutorialB'],
        });

        const learningMoreTutorialIds = baseSkill.learningMoreTutorialIds;

        expect(learningMoreTutorialIds).to.deep.equal(['learningMoreTutorialA', 'learningMoreTutorialB']);
      });
    });

    context('when there are no learningMoreTutorial ids', function () {
      it('returns null', function () {
        const baseSkill = domainBuilder.learningContent.buildBaseSkill({
          ...baseSkillData,
          learningMoreTutorialIds: null,
        });

        const learningMoreTutorialIds = baseSkill.learningMoreTutorialIds;

        expect(learningMoreTutorialIds).to.be.null;
      });
    });
  });

  describe('#get tubeId', function () {
    it('returns tubeId', function () {
      const baseSkill = domainBuilder.learningContent.buildBaseSkill(baseSkillData);

      const tubeId = baseSkill.tubeId;

      expect(tubeId).to.equal(baseSkillData.tubeId);
    });
  });

  describe('#get competenceId', function () {
    it('returns competenceId', function () {
      const baseSkill = domainBuilder.learningContent.buildBaseSkill(baseSkillData);

      const competenceId = baseSkill.competenceId;

      expect(competenceId).to.equal(baseSkillData.competenceId);
    });
  });

  describe('#hint', function () {
    context('when not using the fallback', function () {
      context('when the hint is available in the given locale', function () {
        it('returns the translated hint', function () {
          const baseSkill = domainBuilder.learningContent.buildBaseSkill({
            ...baseSkillData,
            hint_i18n: { fr: 'mon indice', en: 'my hint' },
          });

          const hint = baseSkill.hint({ locale: 'en', useFallback: false });

          expect(hint).to.equal('my hint');
        });
      });

      context('when the hint is not available in the given locale', function () {
        it('returns null', function () {
          const baseSkill = domainBuilder.learningContent.buildBaseSkill({
            ...baseSkillData,
            hint_i18n: { fr: 'mon indice', en: 'my hint' },
          });

          const hint = baseSkill.hint({ locale: 'nl', useFallback: false });

          expect(hint).to.be.null;
        });
      });
    });
    context('when using the fallback', function () {
      context('when the hint is available in the given locale', function () {
        it('returns the translated hint', function () {
          const baseSkill = domainBuilder.learningContent.buildBaseSkill({
            ...baseSkillData,
            hint_i18n: { fr: 'mon indice', en: 'my hint' },
          });

          const hint = baseSkill.hint({ locale: 'en', useFallback: true });

          expect(hint).to.equal('my hint');
        });
      });

      context('when the hint is not available in the given locale', function () {
        context('when the hint is available in the locale fallback', function () {
          it('returns the fallback translated hint', function () {
            const baseSkill = domainBuilder.learningContent.buildBaseSkill({
              ...baseSkillData,
              hint_i18n: { fr: 'mon indice', en: 'my hint' },
            });

            const hint = baseSkill.hint({ locale: 'nl', useFallback: true });

            expect(hint).to.equal('mon indice');
          });
        });
        context('when the hint is not available in the locale fallback', function () {
          it('returns null', function () {
            const baseSkill = domainBuilder.learningContent.buildBaseSkill({
              ...baseSkillData,
              hint_i18n: { es: 'mi pista', en: 'my hint' },
            });

            const hint = baseSkill.hint({ locale: 'nl', useFallback: true });

            expect(hint).to.be.null;
          });
        });
      });
    });
  });
});
