import { expect } from 'chai';
import sinon from 'sinon';

import { updateSession } from '../../../../../../src/certification/enrolment/domain/usecases/update-session.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | UseCase | update-session', function () {
  describe('when session does not exist', function () {
    it('throws a NotFoundError', async function () {
      // given
      const sessionId = 345;
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs({ id: sessionId }).resolves(null);

      // when
      const error = await catchErr(updateSession)({
        address: '1 rue des lauriers',
        room: '2B',
        date: '2021-01-01',
        time: '14:00',
        examiner: 'Louise',
        description: 'coucou',
        sessionId,
        sessionRepository,
      });

      expect(error).to.deepEqualInstance(new NotFoundError("La session n'existe pas ou son accès est restreint"));
    });
  });

  it('submits the update of the session', async function () {
    const sessionId = 345;
    const sessionRepository = { get: sinon.stub(), updateInfo: sinon.fake.resolves() };
    const sessionToUpdate = domainBuilder.certification.enrolment
      .sessionEnrolmentBuilder()
      .withParameters({
        id: sessionId,
        address: '2 rue des rosiers',
        room: '1A',
        date: '2022-02-02',
        time: '15:10',
        examiner: 'Bernanrd',
        description: 'au revoir',
      })
      .build();

    sessionRepository.get.withArgs({ id: sessionId }).resolves(sessionToUpdate);

    const session = await updateSession({
      address: '1 rue des lauriers',
      room: '2B',
      date: '2021-01-01',
      time: '14:00',
      examiner: 'Louise',
      description: 'coucou',
      sessionId,
      sessionRepository,
    });

    sinon.assert.calledOnceWithExactly(sessionRepository.updateInfo, {
      id: sessionId,
      address: '1 rue des lauriers',
      room: '2B',
      date: '2021-01-01',
      time: '14:00',
      examiner: 'Louise',
      description: 'coucou',
    });
    expect(session).to.deep.equal(
      domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .withParameters({
          id: sessionId,
          address: '1 rue des lauriers',
          room: '2B',
          date: '2021-01-01',
          time: '14:00',
          examiner: 'Louise',
          description: 'coucou',
        })
        .build(),
    );
  });
});
