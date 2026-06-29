import sinon from 'sinon';

import { DeleteAndAnonymizeOrganizationLearnerParticipationsScript } from '../../../src/prescription/scripts/delete-and-anonymize-organization-learner-participations-from-combined-courses.js';
import { DomainTransaction } from '../../../src/shared/domain/DomainTransaction.js';
import { expect } from '../../test-helper.js';
import { catchErr } from '../../tooling/test-utils/error.js';

describe('DeleteAndAnonymizeOrganizationLearnerParticipationsScript', function () {
  let script, logger;
  describe('Options', function () {
    it('has the correct options', function () {
      script = new DeleteAndAnonymizeOrganizationLearnerParticipationsScript();
      const { options } = script.metaInfo;
      logger = { info: sinon.stub(), error: sinon.stub() };

      expect(options.combinedCourseId).to.deep.include({
        type: 'number',
        describe: 'a single combined course id',
        demandOption: true,
      });
      expect(options.organizationLearnerId).to.deep.include({
        type: 'number',
        describe: 'a single organization learner id',
        demandOption: true,
      });
    });
  });

  describe('Handle', function () {
    let usecasesStub, domainTransactionStub;
    const combinedCourseId = '1';
    const organizationLearnerId = '2';

    const ENGINEERING_USER_ID = 99999;

    beforeEach(async function () {
      logger = { info: sinon.spy(), error: sinon.spy() };
      sinon.stub(process, 'env').value({ ENGINEERING_USER_ID });
      script = new DeleteAndAnonymizeOrganizationLearnerParticipationsScript();
      usecasesStub = {
        deleteAndAnonymizeParticipationsForALearnerId: sinon.stub(),
      };
      domainTransactionStub = Symbol('domainTransaction');
      sinon.stub(DomainTransaction, 'execute').callsFake((fn) => fn(domainTransactionStub));
      sinon.stub(DomainTransaction, 'getConnection').returns({ rollback: sinon.stub() });
    });

    it('should call usecase with correct arguments and log accordingly if usecase resolves', async function () {
      //given&when
      await script.handle({
        options: { combinedCourseId, organizationLearnerId, dryRun: false },
        logger,
        dependencies: usecasesStub,
      });

      //then
      expect(usecasesStub.deleteAndAnonymizeParticipationsForALearnerId).to.be.calledWithExactly({
        combinedCourseId,
        organizationLearnerId,
        userId: ENGINEERING_USER_ID,
      });

      expect(logger.info).to.have.been.calledWithExactly(
        { event: 'DeleteAndAnonymizeCombinedCoursesScript' },
        `COMMIT: Successfully deleted and anonymized all participations linked to combined course ${combinedCourseId} for learner ${organizationLearnerId}`,
      );
    });
    it('should rollback and log accordingly if usecase fail', async function () {
      //given&when
      usecasesStub.deleteAndAnonymizeParticipationsForALearnerId
        .withArgs({
          combinedCourseId,
          organizationLearnerId,
          userId: ENGINEERING_USER_ID,
        })
        .rejects(new Error('message'));

      await catchErr(script.handle)({
        options: { combinedCourseId, organizationLearnerId, dryRun: false },
        logger,
        dependencies: usecasesStub,
      });

      //then
      expect(logger.error).to.have.been.called;
    });
  });
});
