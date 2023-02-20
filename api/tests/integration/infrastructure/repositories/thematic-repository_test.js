import { expect, mockLearningContent, domainBuilder } from '../../../test-helper';
import thematicRepository from '../../../../lib/infrastructure/repositories/thematic-repository';
import Thematic from '../../../../lib/domain/models/Thematic';

describe('Integration | Repository | thematic-repository', function () {
  describe('#list', function () {
    it('should return thematics with FR default language', async function () {
      // given
      const thematic = domainBuilder.buildThematic({ id: 'recThematic1', name: 'frName' });

      const learningContent = {
        thematics: [{ ...thematic, name_i18n: { fr: 'frName' } }],
      };

      mockLearningContent(learningContent);

      // when
      const actualThematics = await thematicRepository.list();

      // then
      expect(actualThematics).to.deepEqualArray([thematic]);
    });

    it('should return thematics translated in given language', async function () {
      // given
      const locale = 'en';
      const thematic = domainBuilder.buildThematic({ id: 'recThematic1', name: 'enName' });

      const learningContent = {
        thematics: [{ ...thematic, name_i18n: { fr: 'frName', en: 'enName' } }],
      };

      mockLearningContent(learningContent);

      // when
      const actualThematics = await thematicRepository.list({ locale });

      // then
      expect(actualThematics).to.deepEqualArray([thematic]);
    });
  });

  describe('#findByCompetenceId', function () {
    const competenceId = 'competence0';

    // given
    const thematic0 = {
      id: 'recThematic0',
      name_i18n: {
        fr: 'thematic0',
        en: 'thematic0EnUs',
      },
      index: 1,
      tubeIds: ['recTube0'],
      competenceId,
    };

    const thematic1 = {
      id: 'recThematic1',
      name_i18n: {
        fr: 'thematic1',
        en: 'thematic1EnUs',
      },
      index: 1,
      tubeIds: ['recTube1'],
      competenceId,
    };

    const thematics = [
      thematic0,
      thematic1,
      {
        id: 'recThematic2',
        name_i18n: {
          fr: 'thematic2',
          en: 'thematic2EnUs',
        },
        index: 1,
        tubeIds: ['recTube2'],
        competenceId: 'competence1',
      },
    ];

    const learningContent = {
      thematics,
    };

    beforeEach(function () {
      mockLearningContent(learningContent);
    });

    it('should return thematics of a competence', async function () {
      // when
      const foundThematics = await thematicRepository.findByCompetenceIds([competenceId]);

      // then
      expect(foundThematics).to.have.lengthOf(2);
      expect(foundThematics[0]).to.deep.equal({
        id: 'recThematic0',
        name: 'thematic0',
        index: 1,
        tubeIds: ['recTube0'],
        competenceId: 'competence0',
      });
      expect(foundThematics[0]).to.be.instanceOf(Thematic);
      expect(foundThematics[1]).to.deep.equal({
        id: 'recThematic1',
        name: 'thematic1',
        index: 1,
        tubeIds: ['recTube1'],
        competenceId: 'competence0',
      });
      expect(foundThematics[1]).to.be.instanceOf(Thematic);
    });

    describe('When locale is en', function () {
      it('should return the translated name in english', async function () {
        const locale = 'en';
        // when
        const foundThematics = await thematicRepository.findByCompetenceIds([competenceId], locale);

        // then
        expect(foundThematics).to.have.lengthOf(2);
        expect(foundThematics[0]).to.deep.equal({
          id: 'recThematic0',
          name: 'thematic0EnUs',
          index: 1,
          tubeIds: ['recTube0'],
          competenceId: 'competence0',
        });
        expect(foundThematics[0]).to.be.instanceOf(Thematic);
        expect(foundThematics[1]).to.deep.equal({
          id: 'recThematic1',
          name: 'thematic1EnUs',
          index: 1,
          tubeIds: ['recTube1'],
          competenceId: 'competence0',
        });
        expect(foundThematics[1]).to.be.instanceOf(Thematic);
      });
    });
  });

  describe('#findByRecordIds', function () {
    beforeEach(function () {
      const learningContentThematic0 = {
        id: 'recThematic0',
        name_i18n: {
          fr: 'nameThemaFR0',
          en: 'nameThemaEN0',
        },
        index: 'indexThema0',
        description: 'tubeDescription0',
        competenceId: 'recComp0',
      };
      const learningContentThematic1 = {
        id: 'recThematic1',
        name_i18n: {
          fr: 'nameThemaFR1',
          en: 'nameThemaEN1',
        },
        index: 'indexThema1',
        description: 'tubeDescription1',
        competenceId: 'recComp1',
      };
      const learningContentThematic2 = {
        id: 'recThematic2',
        name_i18n: {
          fr: 'nameThemaFR2',
          en: 'nameThemaEN2',
        },
        index: 'indexThema2',
        description: 'tubeDescription2',
        competenceId: 'recComp2',
      };
      mockLearningContent({
        thematics: [learningContentThematic0, learningContentThematic1, learningContentThematic2],
      });
    });

    it('should return a list of thematics (locale FR - default)', async function () {
      // given
      const thematic1 = new Thematic({
        id: 'recThematic1',
        name: 'nameThemaFR1',
        index: 'indexThema1',
        competenceId: 'recComp1',
        tubeIds: [],
      });
      const thematic2 = new Thematic({
        id: 'recThematic2',
        name: 'nameThemaFR2',
        index: 'indexThema2',
        competenceId: 'recComp2',
        tubeIds: [],
      });

      // when
      const thematics = await thematicRepository.findByRecordIds(['recThematic2', 'recThematic1']);

      // then
      expect(thematics).to.deepEqualArray([thematic1, thematic2]);
    });

    it('should return a list of thematics with locale EN', async function () {
      // given
      const thematic1 = new Thematic({
        id: 'recThematic1',
        name: 'nameThemaEN1',
        index: 'indexThema1',
        competenceId: 'recComp1',
        tubeIds: [],
      });
      const thematic2 = new Thematic({
        id: 'recThematic2',
        name: 'nameThemaEN2',
        index: 'indexThema2',
        competenceId: 'recComp2',
        tubeIds: [],
      });

      // when
      const thematics = await thematicRepository.findByRecordIds(['recThematic2', 'recThematic1'], 'en');

      // then
      expect(thematics).to.deepEqualArray([thematic1, thematic2]);
    });
  });
});
