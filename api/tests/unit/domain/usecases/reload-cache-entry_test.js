const { expect, sinon } = require('../../../test-helper');
const preloader = require('../../../../lib/infrastructure/caches/preloader');
const reloadCacheEntry = require('../../../../lib/domain/usecases/reload-cache-entry');

describe('Unit | UseCase | reloadCacheEntry', () => {

  beforeEach(() => {
    sinon.stub(preloader, 'load').resolves();
  });

  afterEach(() => {
    preloader.load.restore();
  });

  it('should preload the record', () => {
    // when
    const promise = reloadCacheEntry({ preloader, tableName: 'Epreuves', recordId: 'recABCDEF' });

    // Then
    return promise.then(() => {
      expect(preloader.load).to.have.been.calledWith({ tableName: 'Epreuves', recordId: 'recABCDEF' });
    });
  });

});

