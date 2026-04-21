import sinon from 'sinon';

import { getSession } from '../../../../../../src/certification/session-management/domain/usecases/get-session.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-session', function () {
  let sessionManagementRepository;

  beforeEach(function () {
    sessionManagementRepository = {
      hasSomeCleaAcquired: sinon.stub(),
      get: sinon.stub(),
    };
  });

  context('when the session exists', function () {
    it('should get the session', async function () {
      // given
      const sessionId = 123;
      const sessionToFind = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
      sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(sessionToFind);
      sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: sessionId }).resolves(false);

      // when
      const { session: actualSession } = await getSession({
        sessionId,
        sessionManagementRepository,
      });

      // then
      expect(actualSession).to.deepEqualInstance(sessionToFind);
    });

    context('when the session does have any acquired clea result', function () {
      it('should return hasSomeCleaAcquired to true', async function () {
        // given
        const sessionId = 123;
        const sessionToFind = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
        sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(sessionToFind);
        sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: sessionId }).resolves(true);

        // when
        const { hasSomeCleaAcquired } = await getSession({
          sessionId,
          sessionManagementRepository,
        });

        // then
        expect(hasSomeCleaAcquired).to.be.true;
      });
    });

    context('when the session does not have acquired clea result', function () {
      it('should return hasSomeCleaAcquired to true', async function () {
        // given
        const sessionId = 123;
        const sessionToFind = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
        sessionManagementRepository.get.withArgs({ id: sessionId }).resolves(sessionToFind);
        sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: sessionId }).resolves(false);

        // when
        const { hasSomeCleaAcquired } = await getSession({
          sessionId,
          sessionManagementRepository,
        });

        // then
        expect(hasSomeCleaAcquired).to.be.false;
      });
    });
  });

  context('when the session does not exist', function () {
    it('should throw an error the session', async function () {
      // given
      const sessionId = 123;
      sessionManagementRepository.get.withArgs({ id: sessionId }).rejects(new NotFoundError());

      // when
      const err = await catchErr(getSession)({
        sessionId,
        sessionManagementRepository,
      });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });
});
