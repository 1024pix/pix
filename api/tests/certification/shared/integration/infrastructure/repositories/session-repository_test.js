import _ from 'lodash';

import * as sessionRepository from '../../../../../../src/certification/shared/infrastructure/repositories/session-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Shared | Integration | Infrastructure | Repository | Session-repository', function () {
  describe('#getWithCertificationCandidates', function () {
    it('should return session information in a session Object', async function () {
      // given

      const sessionCreator = databaseBuilder.factory.buildUser();
      const session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        description: 'CertificationPix pour les jeunes',
        accessCode: 'NJR10',
        version: 2,
        createdBy: sessionCreator.id,
      });
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates({ id: session.id });

      // then
      const expectedSession = domainBuilder.certification.sessionManagement.buildSessionManagement(session);
      expect(actualSession).to.deepEqualInstance(expectedSession);
    });

    it('should return associated certification candidates ordered by lastname and firstname', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Jackson',
        firstName: 'Michael',
        sessionId: session.id,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Stardust',
        firstName: 'Ziggy',
        sessionId: session.id,
      });

      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Jackson',
        firstName: 'Janet',
        sessionId: session.id,
      });

      _.times(5, () => {
        databaseBuilder.factory.buildCertificationCandidate();
      });
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates({ id: session.id });

      // then
      const actualCandidates = _.map(actualSession.certificationCandidates, (item) =>
        _.pick(item, ['sessionId', 'lastName', 'firstName']),
      );
      expect(actualCandidates).to.have.deep.ordered.members([
        { sessionId: session.id, lastName: 'Jackson', firstName: 'Janet' },
        { sessionId: session.id, lastName: 'Jackson', firstName: 'Michael' },
        { sessionId: session.id, lastName: 'Stardust', firstName: 'Ziggy' },
      ]);
    });

    it('should return an empty certification candidates array if there is no candidates', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates({ id: session.id });

      // then
      expect(actualSession.certificationCandidates).to.deep.equal([]);
    });

    it('should return a Not found error when no session was found', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(sessionRepository.getWithCertificationCandidates)({ id: session.id + 1 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
