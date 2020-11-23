const { expect, sinon } = require('../../../../test-helper');
const areaDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/area-datasource');
const lcms = require('../../../../../lib/infrastructure/lcms');

describe('Unit | Infrastructure | Datasource | Learning Content | AreaDatasource', () => {

  describe('#findByRecordIds', () => {

    it('should return an array of matching airtable area data objects', async function() {
      // given
      const records = [ { id: 'recArea0' }, { id: 'recArea1' }, { id: 'recArea2' }];
      sinon.stub(lcms, 'getLatestRelease').resolves({ areas: records });
      const expectedAreaIds = [
        'recArea0','recArea1',
      ];

      // when
      const foundAreas = await areaDatasource.findByRecordIds(expectedAreaIds);
      // then
      expect(foundAreas.map(({ id }) => id)).to.deep.equal(expectedAreaIds);
    });

    it('should return an empty array when there are no objects matching the ids', async function() {
      // given
      const records = [{ id: 'recArea0' }];
      sinon.stub(lcms, 'getLatestRelease').resolves({ areas: records });

      // when
      const foundAreas = await areaDatasource.findByRecordIds(['some_other_id']);

      // then
      expect(foundAreas).to.be.empty;
    });
  });

});
