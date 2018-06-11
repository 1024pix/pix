const { expect, sinon } = require('../../../test-helper');
const preloadCacheEntries = require('../../../../lib/domain/usecases/preload-cache-entries');
const preloader = require('../../../../lib/infrastructure/caches/preloader');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | UseCase | preload-cache-entries', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(preloader, 'loadAreas').resolves();
    sandbox.stub(preloader, 'loadChallenges').resolves();
    sandbox.stub(preloader, 'loadCompetences').resolves();
    sandbox.stub(preloader, 'loadCourses').resolves();
    sandbox.stub(preloader, 'loadSkills').resolves();
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
      expect(preloader.loadAreas).to.have.been.calledOnce;
      expect(preloader.loadChallenges).to.have.been.calledOnce;
      expect(preloader.loadCompetences).to.have.been.calledOnce;
      expect(preloader.loadCourses).to.have.been.calledOnce;
      expect(preloader.loadSkills).to.have.been.calledOnce;
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

