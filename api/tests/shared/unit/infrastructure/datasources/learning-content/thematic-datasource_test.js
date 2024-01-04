import { sinon, expect } from '../../../../../test-helper.js';
import { lcms } from '../../../../../../lib/infrastructure/lcms.js';
import { thematicDatasource } from '../../../../../../src/shared/infrastructure/datasources/learning-content/thematic-datasource.js';

describe('Unit | Infrastructure | Datasource | Learning Content | ThematicDatasource', function () {
  describe('#findByCompetenceIds', function () {
    it('should return an array of matching learning content thematics data objects by competence ids', async function () {
      // given
      const records = [
        { id: 'recThematic0', competenceId: 'competence1' },
        { id: 'recThematic1', competenceId: 'competence2' },
        { id: 'recThematic3', competenceId: 'competence3' },
        { id: 'recThematic2', competenceId: 'competence1' },
      ];
      sinon.stub(lcms, 'getLatestRelease').resolves({ thematics: records });
      const expectedThematicIds = ['recThematic0', 'recThematic1', 'recThematic2'];
      const competenceIds = ['competence1', 'competence2'];

      // when
      const foundThematics = await thematicDatasource.findByCompetenceIds(competenceIds);
      // then
      expect(foundThematics.map(({ id }) => id)).to.deep.equal(expectedThematicIds);
    });
  });
  describe('#findByRecordIds', function () {
    it('should return an array of matching learning content thematics data objects by ids', async function () {
      // given
      const records = [{ id: 'recThematic0' }, { id: 'recThematic1' }, { id: 'recThematic3' }, { id: 'recThematic2' }];
      sinon.stub(lcms, 'getLatestRelease').resolves({ thematics: records });

      // when
      const foundThematics = await thematicDatasource.findByRecordIds(['recThematic1', 'recThematic3']);

      // then
      const expectedThematicIds = ['recThematic1', 'recThematic3'];
      expect(foundThematics.map(({ id }) => id)).to.deep.equal(expectedThematicIds);
    });
  });
});
