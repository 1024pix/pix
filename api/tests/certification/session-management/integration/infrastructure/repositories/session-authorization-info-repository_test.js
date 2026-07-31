import { findBySessionId } from '../../../../../../src/certification/session-management/infrastructure/repositories/session-authorization-info-repository.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session Management | Integration | Infrastructure | Repositories | Session Authorization Info', function () {
  describe('#findBySessionId', function () {
    it('returns null when no session found for given sessionId', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withParameters({ id: 1 })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      // when
      const sessionAuth = await findBySessionId({ sessionId: 2 });

      // then
      expect(sessionAuth).to.be.null;
    });

    context('when session exists', function () {
      it('returns SessionAuthorizationInfo model with expected data when it has a first certification started', async function () {
        // given
        const expectedSessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .isFinalized()
          .withFirstCertificationStarted({ at: new Date() })
          .withParameters({ id: 1, certificationCenterId: 111 })
          .insertToDB({ databaseBuilder });

        await databaseBuilder.commit();

        // when
        const sessionAuth = await findBySessionId({ sessionId: 1 });

        // then
        expect(sessionAuth).to.deepEqualInstance(expectedSessionAuthorizationInfo);
      });

      it('returns SessionAuthorizationInfo model with expected data when certification center has a matching SCO ismanaging students orga', async function () {
        // given
        const expectedSessionAuthorizationInfo = domainBuilder.certification.sessionManagement
          .sessionAuthorizationInfoBuilder()
          .isFinalized()
          .hasMatchingScoIsManagingStudentsOrganization({ organizationId: 456 })
          .withParameters({ id: 1, certificationCenterId: 111 })
          .insertToDB({ databaseBuilder });

        await databaseBuilder.commit();

        // when
        const sessionAuth = await findBySessionId({ sessionId: 1 });

        // then
        expect(sessionAuth).to.deepEqualInstance(expectedSessionAuthorizationInfo);
      });
    });
  });
});
