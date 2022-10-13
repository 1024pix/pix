const { expect, sinon } = require('../../../../test-helper');
const areaDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/area-datasource');
const lcms = require('../../../../../lib/infrastructure/lcms');

describe('Unit | Infrastructure | Datasource | Learning Content | AreaDatasource', function () {
  describe('#findByFrameworkId', function () {
    it('should return an array of matching learning content area data objects by framework id', async function () {
      // given
      const records = [
        { id: 'recArea0', frameworkId: 'framework1' },
        { id: 'recArea1', frameworkId: 'framework2' },
        { id: 'recArea2', frameworkId: 'framework1' },
      ];
      sinon.stub(lcms, 'getLatestRelease').resolves({ areas: records });
      const expectedAreaIds = ['recArea0', 'recArea2'];
      const frameworkId = 'framework1';

      // when
      const foundAreas = await areaDatasource.findByFrameworkId(frameworkId);
      // then
      expect(foundAreas.map(({ id }) => id)).to.deep.equal(expectedAreaIds);
    });
  });
});
