const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');

describe('Unit | UseCase | find-paginated-filtered-sessions', () => {
  let sessionRepository;
  let restoreValidateFilters;

  beforeEach(() => {
    sessionRepository = {
      findPaginatedFiltered: sinon.stub(),
    };
    restoreValidateFilters = sessionValidator.validateFilters;
    sessionValidator.validateFilters = sinon.stub();
  });

  afterEach(() => {
    sessionValidator.validateFilters = restoreValidateFilters;
  });

  context('when filters are valid', () => {

    it('should result sessions with filtering and pagination', async () => {
      // given
      const filters = 'someFilters';
      const page = 'somePageConfiguration';
      const resolvedPagination = 'pagination';
      const matchingSessions = 'listOfMatchingSessions';
      sessionValidator.validateFilters.withArgs(filters).returns();
      sessionRepository.findPaginatedFiltered.withArgs({ filters, page }).resolves({ sessions: matchingSessions, pagination: resolvedPagination });

      // when
      const response = await usecases.findPaginatedFilteredSessions({ filters, page, sessionRepository });

      // then
      expect(response.sessions).to.equal(matchingSessions);
      expect(response.pagination).to.equal(resolvedPagination);
    });
  });

  context('when filters are not valid', () => {

    it('should result empty list of session with basic pagination', async () => {
      // given
      const filters = 'someFilters';
      const page = { number: 'aNumber', size: 'aSize' };
      const basicPagination = {
        page: 'aNumber',
        pageSize: 'aSize',
        rowCount: 0,
        pageCount: 0,
      };
      sessionValidator.validateFilters.withArgs(filters).throws();

      // when
      const response = await usecases.findPaginatedFilteredSessions({ filters, page, sessionRepository });

      // then
      expect(sessionRepository.findPaginatedFiltered.notCalled).to.be.true;
      expect(response.pagination).to.deep.equal(basicPagination);
      expect(response.sessions).to.be.empty;
    });
  });
});
