const _ = require('lodash');
const { expect, sinon } = require('../../../test-helper');
const AirtableDatasources = require('../../../../lib/infrastructure/datasources/airtable');
const preloader = require('../../../../lib/infrastructure/caches/preloader');
const airtable = require('../../../../lib/infrastructure/airtable');

describe('Unit | Infrastructure | Caches | preloader', () => {

  describe('#loadAllTables', () => {

    it('should preload all Airtable data sources', async () => {
      // given
      _.map(AirtableDatasources, (datasource) => sinon.stub(datasource, 'preload'));

      // when
      await preloader.loadAllTables();

      // then
      _.map(AirtableDatasources, (datasource) => expect(datasource.preload).to.have.been.calledOnce);
    });
  });

  describe('#load', () => {

    it('should load given Airtable record', async () => {
      // given
      const tableName = 'Table';
      const recordId = 'recXYZ';
      const options = { tableName, recordId };
      sinon.stub(airtable, 'getRecordSkipCache').withArgs(tableName, recordId).resolves(true);

      // when
      const success = await preloader.load(options);

      // then
      expect(success).to.be.true;
    });
  });
});
