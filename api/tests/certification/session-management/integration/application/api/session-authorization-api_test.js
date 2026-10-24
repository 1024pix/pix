import { expect } from 'chai';

import { findBySessionId } from '../../../../../../src/certification/session-management/application/api/session-authorization-api.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session Management | Integration | Application | Api | Session Authorization', function () {
  describe('#findBySessionId', function () {
    it('returns null when no session found for given sessionId', async function () {
      // given
      databaseBuilder.factory.buildSession({ id: 111 });
      await databaseBuilder.commit();

      // when
      const sessionAuth = await findBySessionId({ sessionId: 3 });

      // then
      expect(sessionAuth).to.be.null;
    });

    it('returns the session authorization DTO when found for given sessionId', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        certificationCenterId,
        finalizedAt: null,
        publishedAt: null,
        assignedCertificationOfficerId: null,
      }).id;
      await databaseBuilder.commit();

      // when
      const sessionAuthorizationDTO = await findBySessionId({ sessionId });

      // then
      expect(sessionAuthorizationDTO).to.deep.equal({
        id: sessionId,
        sessionStatus: domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status: SESSION_STATUSES.CREATED })
          .build(),
        scoIsManagingStudentsOrganizationId: null,
        certificationCenterId,
      });
    });
  });
});
