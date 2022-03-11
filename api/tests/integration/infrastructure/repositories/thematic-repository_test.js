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
    it('should return thematics of a competence', async function () {
      // given
      const thematic0 = {
        id: 'recThematic0',
        name: 'thematic0',
        index: 1,
        tubeIds: ['recTube0'],
        competenceId: 'competence0',
      };

      const thematic1 = {
        id: 'recThematic1',
        name: 'thematic1',
        index: 1,
        tubeIds: ['recTube1'],
        competenceId: 'competence0',
      };

      const thematics = [
        thematic0,
        thematic1,
        {
          id: 'recThematic1',
          name: 'thematic1',
          index: 1,
          tubeIds: ['recTube1'],
          competenceId: 'competence1',
        },
      ];

      const learningContent = {
        thematics,
      };

      const competenceId = 'competence0';

      mockLearningContent(learningContent);

      // when
      const foundThematics = await thematicRepository.findByCompetenceId(competenceId);

      // then
      expect(foundThematics).to.have.lengthOf(2);
      expect(foundThematics[0]).to.deep.equal(new Thematic(thematic0));
      expect(foundThematics[1]).to.deep.equal(new Thematic(thematic1));
    });
  });
});
