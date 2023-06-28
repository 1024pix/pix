import { databaseBuilder, expect, catchErr } from '../../../../../../tests/test-helper.js';
import { NotFoundError } from '../../../../../shared/domain/errors.js';
import { Session } from '../../../../../shared/domain/models/Session.js';
import * as sessionRepository from '../../../../infrastructure/repositories/session-repository.js';

describe('Integration | Repository | Session', function () {
  describe('#get', function () {
    let session;
    let expectedSessionValues;

    beforeEach(async function () {
      // given
      session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        description: 'CertificationPix pour les jeunes',
        accessCode: 'NJR10',
      });
      expectedSessionValues = {
        id: session.id,
        certificationCenter: session.certificationCenter,
        address: session.address,
        room: session.room,
        examiner: session.examiner,
        date: session.date,
        time: session.time,
        description: session.description,
        accessCode: session.accessCode,
      };
      await databaseBuilder.commit();
    });

    it('should return session informations in a session Object', async function () {
      // when
      const actualSession = await sessionRepository.get(session.id);

      // then
      expect(actualSession).to.be.instanceOf(Session);
      expect(actualSession, 'date').to.deep.includes(expectedSessionValues);
    });

    it('should return a Not found error when no session was found', async function () {
      // when
      const error = await catchErr(sessionRepository.get)(2);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#isSco', function () {
    context('when the certification center is not SCO', function () {
      it('should return false', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          name: 'PRO_CERTIFICATION_CENTER',
          type: 'PRO',
          externalId: 'EXTERNAL_ID',
        });

        const session = databaseBuilder.factory.buildSession({
          certificationCenter: certificationCenter.name,
          certificationCenterId: certificationCenter.id,
          finalizedAt: null,
          publishedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const result = await sessionRepository.isSco({
          sessionId: session.id,
        });

        // then
        expect(result).to.be.false;
      });
    });

    context('when the certification center is SCO', function () {
      it('should return true', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          name: 'SCO',
          externalId: 'EXTERNAL_ID',
          type: 'SCO',
        });

        const session = databaseBuilder.factory.buildSession({
          certificationCenter: certificationCenter.name,
          certificationCenterId: certificationCenter.id,
          finalizedAt: null,
          publishedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const result = await sessionRepository.isSco({
          sessionId: session.id,
        });

        // then
        expect(result).to.be.true;
      });
    });
  });
});
