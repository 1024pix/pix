const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
const thematicRepository = require('../../../../lib/infrastructure/repositories/thematic-repository');
const Thematic = require('../../../../lib/domain/models/Thematic');

describe('Integration | Repository | thematic-repository', function () {
  describe('#list', function () {
    it('should return thematics', async function () {
      // given
      const thematic = domainBuilder.buildThematic({ id: 'recThematic1' });

      const learningContent = {
        thematics: [thematic],
      };

      mockLearningContent(learningContent);

      // when
      const actualThematics = await thematicRepository.list();

      // then
      expect(actualThematics).to.deepEqualArray([thematic]);
    });
  });

  describe('#findByCompetenceId', function () {
    const competenceId = 'competence0';

    // given
    const thematic0 = {
      id: 'recThematic0',
      name: 'thematic0',
      nameEnUs: 'thematic0EnUs',
      index: 1,
      tubeIds: ['recTube0'],
      competenceId,
    };

    const thematic1 = {
      id: 'recThematic1',
      name: 'thematic1',
      nameEnUs: 'thematic1EnUs',
      index: 1,
      tubeIds: ['recTube1'],
      competenceId,
    };

    const thematics = [
      thematic0,
      thematic1,
      {
        id: 'recThematic2',
        name: 'thematic2',
        nameEnUs: 'thematic2EnUs',
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
      });
      expect(foundThematics[0]).to.be.instanceOf(Thematic);
      expect(foundThematics[1]).to.deep.equal({
        id: 'recThematic1',
        name: 'thematic1',
        index: 1,
        tubeIds: ['recTube1'],
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
        });
        expect(foundThematics[0]).to.be.instanceOf(Thematic);
        expect(foundThematics[1]).to.deep.equal({
          id: 'recThematic1',
          name: 'thematic1EnUs',
          index: 1,
          tubeIds: ['recTube1'],
        });
        expect(foundThematics[1]).to.be.instanceOf(Thematic);
      });
    });
  });
});
