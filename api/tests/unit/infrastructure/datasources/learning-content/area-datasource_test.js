import { expect, sinon } from '../../../../test-helper';
import areaDatasource from '../../../../../lib/infrastructure/datasources/learning-content/area-datasource';
import lcms from '../../../../../lib/infrastructure/lcms';

describe('Unit | Infrastructure | Datasource | Learning Content | AreaDatasource', function () {
  describe('#findByRecordIds', function () {
    it('should return an array of matching learning content area data objects', async function () {
      // given
      const records = [{ id: 'recArea0' }, { id: 'recArea1' }, { id: 'recArea2' }];
      sinon.stub(lcms, 'getLatestRelease').resolves({ areas: records });
      const expectedAreaIds = ['recArea0', 'recArea1'];

      // when
      const foundAreas = await areaDatasource.findByRecordIds(expectedAreaIds);
      // then
      expect(foundAreas.map(({ id }) => id)).to.deep.equal(expectedAreaIds);
    });

    it('should return an empty array when there are no objects matching the ids', async function () {
      // given
      const records = [{ id: 'recArea0' }];
      sinon.stub(lcms, 'getLatestRelease').resolves({ areas: records });

      // when
      const foundAreas = await areaDatasource.findByRecordIds(['some_other_id']);

      // then
      expect(foundAreas).to.be.empty;
    });
  });

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
