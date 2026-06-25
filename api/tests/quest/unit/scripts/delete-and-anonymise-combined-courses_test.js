import sinon from 'sinon';

import { DeleteAndAnonymiseCombinedCoursesScript } from '../../../../src/quest/scripts/delete-and-anonymise-combined-courses.js';
import { DomainTransaction } from '../../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../../test-helper.js';

describe('DeleteAndAnonymiseCombinedCoursesScript', function () {
  let script, logger;
  describe('Options', function () {
    it('has the correct options', function () {
      script = new DeleteAndAnonymiseCombinedCoursesScript();
      const { options } = script.metaInfo;

      expect(options.combinedCourseIds).to.deep.include({
        type: 'string',
        describe: 'a list of comma separated combined course ids',
        demandOption: true,
      });
    });
  });

  describe('Handle', function () {
    let usecasesStub, domainTransactionStub, jobClientStub;
    const combinedCourseId = Symbol('1');
    const ENGINEERING_USER_ID = 99999;

    beforeEach(async function () {
      script = new DeleteAndAnonymiseCombinedCoursesScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      jobClientStub = {
        initialize: () => {
          return;
        },
        stop: () => {
          return;
        },
      };
      sinon.stub(process, 'env').value({ ENGINEERING_USER_ID });

      usecasesStub = {
        deleteAndAnonymizeCombinedCourses: sinon.stub(),
      };
      domainTransactionStub = Symbol('domainTransaction');
      sinon.stub(DomainTransaction, 'execute').callsFake((fn) => fn(domainTransactionStub));
      sinon.stub(DomainTransaction, 'getConnection').returns({ rollback: sinon.stub() });
    });

    it('should call usecase with correct arguments and log accordingly if usecase resolves', async function () {
      //given&when
      await script.handle({
        options: { combinedCourseIds: [combinedCourseId] },
        logger,
        dependencies: { usecases: usecasesStub, jobClient: jobClientStub },
      });

      //then
      expect(usecasesStub.deleteAndAnonymizeCombinedCourses).to.be.calledWithExactly({
        combinedCourseIds: [combinedCourseId],
        userId: ENGINEERING_USER_ID,
      });

      expect(logger.info).to.have.been.calledWithExactly(
        { event: 'DeleteAndAnonymizeCombinedCoursesScript' },
        `COMMIT: Successfully deleted ${[combinedCourseId].length} combined courses and anonymized their participations`,
      );
    });
    it('should rollback and log accordingly if usecase fail', async function () {
      //given&when
      usecasesStub.deleteAndAnonymizeCombinedCourses
        .withArgs({
          combinedCourseIds: [combinedCourseId],
          userId: ENGINEERING_USER_ID,
        })
        .rejects();

      await expect(
        script.handle({
          options: { combinedCourseIds: [combinedCourseId] },
          logger,
          dependencies: { usecases: usecasesStub, jobClient: jobClientStub },
        }),
      ).to.be.rejected;
    });
  });
});
