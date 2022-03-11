const { sinon, expect } = require('../../../../test-helper');
const lcms = require('../../../../../lib/infrastructure/lcms');
const thematicDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/thematic-datasource');

describe('Unit | Infrastructure | Datasource | Learning Content | ThematicDatasource', function () {
  describe('#findByCompetenceId', function () {
    it('should return an array of matching learning content area data objects by framework id', async function () {
      // given
      const records = [
        { id: 'recThematic0', competenceId: 'competence1' },
        { id: 'recThematic1', competenceId: 'competence2' },
        { id: 'recThematic2', competenceId: 'competence1' },
      ];
      sinon.stub(lcms, 'getLatestRelease').resolves({ thematics: records });
      const expectedThematicIds = ['recThematic0', 'recThematic2'];
      const competenceId = 'competence1';

      // when
      const foundThematics = await thematicDatasource.findByCompetenceId(competenceId);
      // then
      expect(foundThematics.map(({ id }) => id)).to.deep.equal(expectedThematicIds);
    });
  });
});
