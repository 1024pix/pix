import sinon from 'sinon';

import { UpdateCombinedCoursesNameScript } from '../../../../src/quest/scripts/update-name-of-combined-courses.js';
import { DomainTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../test-helper.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('UpdateNameOfCombinedCoursesScript', function () {
  let usecasesStub, logger, domainTransactionStub;

  const script = new UpdateCombinedCoursesNameScript();

  beforeEach(function () {
    usecasesStub = {
      updateCombinedCourses: sinon.stub().resolves(),
    };
    logger = { info: sinon.stub(), error: sinon.stub() };
    domainTransactionStub = Symbol('domainTransaction');
    sinon.stub(DomainTransaction, 'execute').callsFake((fn) => fn(domainTransactionStub));
    sinon.stub(DomainTransaction, 'getConnection').returns({ rollback: sinon.stub() });
  });

  context('when dry run is true', function () {
    it('should not update name of combined course', async function () {
      await script.handle({
        options: { dryRun: true, combinedCourseIds: [1, 2], newName: 'new-name' },
        logger,
        dependencies: usecasesStub,
      });

      expect(logger.info).to.have.been.calledWith('ROLLBACK due to dryRun');
    });
  });
  context('when dry run is false', function () {
    it('should call update combined course usecase', async function () {
      await script.handle({
        options: { dryRun: false, combinedCourseIds: [1, 2], newName: 'new-name' },
        logger,
        dependencies: usecasesStub,
      });

      expect(usecasesStub.updateCombinedCourses).to.have.been.calledWithExactly({
        combinedCourseIds: [1, 2],
        name: 'new-name',
      });
    });
    it('should log accordingly if usecase fails', async function () {
      //given
      usecasesStub.updateCombinedCourses
        .withArgs({
          combinedCourseIds: [1, 2],
          name: 'new-name',
        })
        .rejects();

      //when
      await catchErr(script.handle)({
        options: { combinedCourseIds: [1, 2], newName: 'new-name' },
        logger,
        dependencies: usecasesStub,
      });

      //then
      expect(logger.error).to.have.been.called;
    });
  });
});
