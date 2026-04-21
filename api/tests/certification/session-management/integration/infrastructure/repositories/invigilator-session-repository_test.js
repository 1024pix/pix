import { InvigilatorSession } from '../../../../../../src/certification/session-management/domain/read-models/InvigilatorSession.js';
import * as InvigilatorSessionRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/invigilator-session-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Repository | Certification | session | SessionManagement', function () {
  describe('#get', function () {
    let session;
    let expectedSessionValues;

    beforeEach(async function () {
      // given
      const finalizedAt = new Date();
      session = databaseBuilder.factory.buildSession({ finalizedAt });
      expectedSessionValues = {
        invigilatorPassword: session.invigilatorPassword,
      };
      await databaseBuilder.commit();
    });

    it('should return session informations in a invigilator session Object', async function () {
      // when
      const actualSession = await InvigilatorSessionRepository.get({ id: session.id });

      // then
      expect(actualSession).to.be.instanceOf(InvigilatorSession);
      expect(actualSession, 'date').to.deep.includes(expectedSessionValues);
    });

    it('should return a Not found error when no session was found', async function () {
      // when
      const error = await catchErr(InvigilatorSessionRepository.get)({ id: 2 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
