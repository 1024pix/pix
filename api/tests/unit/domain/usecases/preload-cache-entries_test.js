const { expect, sinon } = require('../../../test-helper');
const preloadCacheEntries = require('../../../../lib/domain/usecases/preload-cache-entries');
const preloader = require('../../../../lib/infrastructure/caches/preloader');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | UseCase | preload-cache-entries', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(preloader, 'loadAllTables').resolves();
    sandbox.stub(logger, 'info').returns();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should load Airtable objects', () => {
    // when
    const promise = preloadCacheEntries({ preloader, logger });

    // Then
    return promise.then(() => {
      expect(preloader.loadAllTables).to.have.been.calledOnce;
    });
  });

  it('should log start and stop of usecase', () => {
    // when
    const promise = preloadCacheEntries({ preloader, logger });

    // Then
    return promise.then(() => {
      expect(logger.info).to.have.been.calledWith('Start');
      expect(logger.info).to.have.been.calledWith('Done');
    });
  });
});

