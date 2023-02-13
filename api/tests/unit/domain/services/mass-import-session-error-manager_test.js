const { expect } = require('../../../test-helper');
const { MassImportSessionErrorManager } = require('../../../../lib/domain/services/Mass-import-session-error-manager');

describe('Unit | Service | Mass import session error manager', function () {
  describe('#addBlockingError', function () {
    context('when there is no existing error for the given line', function () {
      it('should add a new line withe a blocking error', function () {
        // given
        const massImportSessionErrorManager = new MassImportSessionErrorManager();

        // when
        massImportSessionErrorManager.addBlockingError({ line: 9, error: 'an error' });

        // then
        expect(massImportSessionErrorManager.blockingErrors).to.deep.equal([{ ['9']: ['an error'] }]);
      });
    });

    context('when there is an existing error for the given line', function () {
      it('should add a blocking error to the existing error', function () {
        // given
        const massImportSessionErrorManager = new MassImportSessionErrorManager();
        massImportSessionErrorManager.addBlockingError({ line: 9, error: 'an error' });

        // when
        massImportSessionErrorManager.addBlockingError({ line: 9, error: 'an other error' });

        // then
        expect(massImportSessionErrorManager.blockingErrors).to.deep.equal([{ ['9']: ['an error', 'an other error'] }]);
      });
    });
  });

  describe('#addNonBlockingError', function () {
    context('when there is no existing error for the given line', function () {
      it('should add a new line with a non blocking error', function () {
        // given
        const massImportSessionErrorManager = new MassImportSessionErrorManager();

        // when
        massImportSessionErrorManager.addNonBlockingError({ line: 9, error: 'an error' });

        // then
        expect(massImportSessionErrorManager.nonBlockingErrors).to.deep.equal([{ ['9']: ['an error'] }]);
      });
    });

    context('when there is an existing error for the given line', function () {
      it('should add a non blocking error to the existing line', function () {
        // given
        const massImportSessionErrorManager = new MassImportSessionErrorManager();
        massImportSessionErrorManager.addNonBlockingError({ line: 9, error: 'an error' });

        // when
        massImportSessionErrorManager.addNonBlockingError({ line: 9, error: 'an other error' });

        // then
        expect(massImportSessionErrorManager.nonBlockingErrors).to.deep.equal([
          { ['9']: ['an error', 'an other error'] },
        ]);
      });
    });
  });

  describe('#hasBlockingErrors', function () {
    context('when there is at least one blocking error', function () {
      it('should return true', function () {
        // given
        const massImportSessionErrorManager = new MassImportSessionErrorManager();
        massImportSessionErrorManager.addBlockingError({ line: 9, error: 'an error' });

        // when
        // then
        expect(massImportSessionErrorManager.hasBlockingErrors).to.be.true;
      });
    });

    context('when there is no blocking error', function () {
      it('should return false', function () {
        // given
        const massImportSessionErrorManager = new MassImportSessionErrorManager();

        // when
        // then
        expect(massImportSessionErrorManager.hasBlockingErrors).to.be.false;
      });
    });

    context('when there is an existing error for the given line', function () {
      it('should add a non blocking error to the existing line', function () {
        // given
        const massImportSessionErrorManager = new MassImportSessionErrorManager();
        massImportSessionErrorManager.addNonBlockingError({ line: 9, error: 'an error' });

        // when
        massImportSessionErrorManager.addNonBlockingError({ line: 9, error: 'an other error' });

        // then
        expect(massImportSessionErrorManager.nonBlockingErrors).to.deep.equal([
          { ['9']: ['an error', 'an other error'] },
        ]);
      });
    });
  });
});
