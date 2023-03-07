const { expect, sinon } = require('../../../../test-helper');
const {
  frameworkDatasource,
} = require('../../../../../lib/infrastructure/datasources/learning-content/framework-datasource');
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

  describe('#getByName', function () {
    it('should return a framework', async function () {
      // given
      const frameworks = [
        { id: 'recFramework0', name: 'Framework0' },
        { id: 'recFramework1', name: 'Framework1' },
        { id: 'recFramework2', name: 'Framework2' },
      ];
      sinon.stub(lcms, 'getLatestRelease').resolves({ frameworks });

      // when
      const foundFramework = await frameworkDatasource.getByName('Framework0');

      // then
      expect(foundFramework).to.deep.equal({ id: 'recFramework0', name: 'Framework0' });
    });

    describe('when framework not found', function () {
      it('should return undefined', async function () {
        const frameworks = [
          { id: 'recFramework0', name: 'Framework0' },
          { id: 'recFramework1', name: 'Framework1' },
          { id: 'recFramework2', name: 'Framework2' },
        ];
        sinon.stub(lcms, 'getLatestRelease').resolves({ frameworks });

        // when
        const foundFramework = await frameworkDatasource.getByName('Framework3');

        // then
        expect(foundFramework).to.be.undefined;
      });
    });
  });

  describe('#findByRecordIds', function () {
    it('should return an array of learning content frameworks data objects by ids', async function () {
      // given
      const records = [{ id: 'recFramework0' }, { id: 'recFramework1' }, { id: 'recFramework2' }];
      sinon.stub(lcms, 'getLatestRelease').resolves({ frameworks: records });

      // when
      const foundFrameworks = await frameworkDatasource.findByRecordIds(['recFramework0', 'recFramework2']);

      // then
      expect(foundFrameworks).to.deep.equal([{ id: 'recFramework0' }, { id: 'recFramework2' }]);
    });

    it('should return an empty array when no frameworks data objects found for ids', async function () {
      // given
      const records = [{ id: 'recFramework0' }, { id: 'recFramework1' }, { id: 'recFramework2' }];
      sinon.stub(lcms, 'getLatestRelease').resolves({ frameworks: records });

      // when
      const foundFrameworks = await frameworkDatasource.findByRecordIds(['recFrameworkCOUCOU']);

      // then
      expect(foundFrameworks).to.deep.equal([]);
    });
  });
});
