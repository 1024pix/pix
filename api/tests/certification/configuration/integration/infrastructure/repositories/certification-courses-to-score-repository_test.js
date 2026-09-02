import { expect } from 'chai';

import { findIdsByVersionId } from '../../../../../../src/certification/configuration/infrastructure/repositories/certification-courses-to-score-repository.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Infrastructure | Repositories | certification-courses-to-score-repository', function () {
  describe('#findIdsByVersionId', function () {
    it('returns ids of certification courses on finalized sessions for the given version', async function () {
      // given
      const version = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive()
        .withParameters({ id: 1, scope: SCOPES.PIX_PLUS_DROIT })
        .insertToDB({ databaseBuilder });

      const finalizedSession = databaseBuilder.factory.buildSession({ finalizedAt: new Date('2025-01-01') });
      const courseOnFinalizedSession = databaseBuilder.factory.buildCertificationCourse({
        sessionId: finalizedSession.id,
        versionId: version.id,
      });

      await databaseBuilder.commit();

      // when
      const ids = await findIdsByVersionId({ versionId: version.id });

      // then
      expect(ids).to.deep.equal([courseOnFinalizedSession.id]);
    });

    it('excludes certification courses on non-finalized sessions', async function () {
      // given
      const version = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive()
        .withParameters({ id: 2, scope: SCOPES.PIX_PLUS_DROIT })
        .insertToDB({ databaseBuilder });

      const nonFinalizedSession = databaseBuilder.factory.buildSession({ finalizedAt: null });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId: nonFinalizedSession.id,
        versionId: version.id,
      });

      await databaseBuilder.commit();

      // when
      const ids = await findIdsByVersionId({ versionId: version.id });

      // then
      expect(ids).to.be.empty;
    });

    it('excludes certification courses belonging to a different version', async function () {
      // given
      const version = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive()
        .withParameters({ id: 3, scope: SCOPES.PIX_PLUS_DROIT })
        .insertToDB({ databaseBuilder });

      const otherVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive()
        .withParameters({ id: 4, scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE })
        .insertToDB({ databaseBuilder });

      const finalizedSession = databaseBuilder.factory.buildSession({ finalizedAt: new Date('2025-01-01') });
      databaseBuilder.factory.buildCertificationCourse({
        sessionId: finalizedSession.id,
        versionId: otherVersion.id,
      });

      await databaseBuilder.commit();

      // when
      const ids = await findIdsByVersionId({ versionId: version.id });

      // then
      expect(ids).to.be.empty;
    });
  });
});
