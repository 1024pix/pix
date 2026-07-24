import {
  findById,
  update,
} from '../../../../../../src/certification/session-management/infrastructure/repositories/supervised-session-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session Management | Integration | Infrastructure | Repositories | Supervised Session', function () {
  describe('#findById', function () {
    it('returns null when no session found', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .supervisedSessionBuilder()
        .withParameters({ id: 1 })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      // when
      const supervisedSession = await findById({ id: 2 });

      // then
      expect(supervisedSession).to.be.null;
    });

    context('when some certifications started in the session', function () {
      it('returns the supervised session when found with expected firstCertificationStarted id', async function () {
        // given
        const expectedStartedSupervisedSession = domainBuilder.certification.sessionManagement
          .supervisedSessionBuilder()
          .withStartedCertifications({ count: 3, firstStartedCertificationId: 2 })
          .withParameters({ id: 1 })
          .insertToDB({ databaseBuilder });

        await databaseBuilder.commit();

        // when
        const startedSupervisedSession = await findById({ id: 1 });

        // then
        expect(startedSupervisedSession).to.deepEqualInstance(expectedStartedSupervisedSession);
        expect(startedSupervisedSession.firstStartedCertificationId).to.equal(2);
      });
    });

    context('when no certifications started yet in the session', function () {
      it('returns the supervised session when found with no firstCertificationStarted id', async function () {
        // given
        const expectedStartedSupervisedSession = domainBuilder.certification.sessionManagement
          .supervisedSessionBuilder()
          .withStartedCertifications({ count: 0 })
          .withParameters({ id: 1 })
          .insertToDB({ databaseBuilder });

        await databaseBuilder.commit();

        // when
        const startedSupervisedSession = await findById({ id: 1 });

        // then
        expect(startedSupervisedSession).to.deepEqualInstance(expectedStartedSupervisedSession);
        expect(startedSupervisedSession.firstStartedCertificationId).to.be.null;
      });
    });
  });

  describe('#update', function () {
    it('updates only date field', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .supervisedSessionBuilder()
        .withStartedCertifications({ count: 3, firstStartedCertificationId: 123 })
        .withParameters({ id: 1, date: '2021-01-01' })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      const supervisedSessionToUpdate = domainBuilder.certification.sessionManagement
        .supervisedSessionBuilder()
        .withStartedCertifications({ count: 5, firstStartedCertificationId: 555 })
        .withParameters({ id: 1, date: '2025-05-05' })
        .build();

      // when
      await update(supervisedSessionToUpdate);

      // then
      const updatedSupervisedSession = await findById({ id: 1 });
      expect(updatedSupervisedSession).to.deepEqualInstance(
        domainBuilder.certification.sessionManagement
          .supervisedSessionBuilder()
          .withStartedCertifications({ count: 3, firstStartedCertificationId: 123 })
          .withParameters({ id: 1, date: '2025-05-05' })
          .build(),
      );
    });
  });
});
