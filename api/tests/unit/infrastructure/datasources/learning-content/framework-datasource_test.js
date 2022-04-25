const { expect, sinon } = require('../../../../test-helper');
const frameworkDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/framework-datasource');
const lcms = require('../../../../../lib/infrastructure/lcms');

describe('Unit | Infrastructure | Datasource | Learning Content | FrameworkDatasource', function () {
  describe('#list', function () {
    it('should return an array of learning content frameworks data objects', async function () {
      // given
      const records = [{ id: 'recFramework0' }, { id: 'recFramework1' }, { id: 'recFramework2' }];
      sinon.stub(lcms, 'getLatestRelease').resolves({ frameworks: records });

      // when
      const foundFrameworks = await frameworkDatasource.list();

      // then
      expect(foundFrameworks).to.deep.equal(records);
    });
  });
});
