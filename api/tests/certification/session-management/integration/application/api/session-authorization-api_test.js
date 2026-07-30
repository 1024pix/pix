import { findBySessionId } from '../../../../../../src/certification/session-management/application/api/session-authorization-api.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session Management | Integration | Application | Api | Session Authorization', function () {
  describe('#findBySessionId', function () {
    it('returns null when no session found for given sessionId', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .withParameters({ id: 1 })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      // when
      const sessionAuth = await findBySessionId({ sessionId: 3 });

      // then
      expect(sessionAuth).to.be.null;
    });

    it('returns the session authorization DTO when found for given sessionId', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .sessionAuthorizationInfoBuilder()
        .isFinalized()
        .withFirstCertificationStarted({ at: new Date('2021-01-01') })
        .hasMatchingScoIsManagingStudentsOrganization({ organizationId: 123 })
        .withParameters({ id: 1 })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      // when
      const sessionAuthorizationDTO = await findBySessionId({ sessionId: 1 });

      // then
      expect(sessionAuthorizationDTO).to.deep.equal({
        id: 1,
        isFinalized: true,
        hasExpired: true,
        hasStarted: true,
        scoIsManagingStudentsOrganizationId: 123,
      });
    });
  });
});
