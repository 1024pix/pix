import { expect, databaseBuilder } from '../../../../../test-helper.js';
import * as candidateRepository from '../../../../../../src/certification/session/infrastructure/repositories/candidate-repository.js';
import _ from 'lodash';

describe('Integration | Certification | Session | Repository | Candidate', function () {
  describe('#findBySessionId', function () {
    let sessionId;

    beforeEach(async function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      _.each(
        [
          { lastName: 'Jackson', firstName: 'Michael', sessionId },
          { lastName: 'Jackson', firstName: 'Janet', sessionId },
          { lastName: 'Mercury', firstName: 'Freddy', sessionId },
          { lastName: 'Gallagher', firstName: 'Noel', sessionId: anotherSessionId },
          { lastName: 'Gallagher', firstName: 'Liam', sessionId: anotherSessionId },
          { lastName: 'Brown', firstName: 'James', sessionId },
        ],
        databaseBuilder.factory.buildCertificationCandidate,
      );

      await databaseBuilder.commit();
    });

    context('when there are some certification candidates with the given session id', function () {
      it('should fetch, alphabetically sorted, the certification candidates with a specific session ID', async function () {
        // when
        const actualCandidates = await candidateRepository.findBySessionId(sessionId);

        // then
        expect(actualCandidates[0].firstName).to.equal('James');
        expect(actualCandidates[1].firstName).to.equal('Janet');
        expect(actualCandidates[2].firstName).to.equal('Michael');
        expect(actualCandidates[3].firstName).to.equal('Freddy');
        expect(actualCandidates).to.have.lengthOf(4);
      });
    });

    context('when some returned candidates have complementary certification subscription', function () {
      it('return ordered candidates with associated subscription', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const rockCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+Rock',
          key: 'ROCK',
        });
        const matthieuChedid = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Chedid',
          firstName: 'Matthieu',
          sessionId,
        });
        const louisChedid = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Chedid',
          firstName: 'Louis',
          sessionId,
        });
        databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Herbie',
          firstName: 'Hancock',
          sessionId,
        });

        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: rockCertification.id,
          certificationCandidateId: matthieuChedid.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: rockCertification.id,
          certificationCandidateId: louisChedid.id,
        });

        await databaseBuilder.commit();

        // when
        const candidates = await candidateRepository.findBySessionId(sessionId);

        // then
        const firstCandidate = candidates[0];
        const secondCandidate = candidates[1];
        const thirdCandidate = candidates[2];

        expect(firstCandidate.firstName).to.equal('Louis');
        expect(firstCandidate.lastName).to.equal('Chedid');
        expect(firstCandidate.complementaryCertificationId).to.equal(rockCertification.id);

        expect(secondCandidate.firstName).to.equal('Matthieu');
        expect(secondCandidate.lastName).to.equal('Chedid');
        expect(secondCandidate.complementaryCertificationId).to.equal(rockCertification.id);

        expect(thirdCandidate.firstName).to.equal('Hancock');
        expect(thirdCandidate.lastName).to.equal('Herbie');
        expect(thirdCandidate.complementaryCertificationId).to.equal(null);
      });
    });

    context('when there is no certification candidates with the given session ID', function () {
      it('should return an empty array', async function () {
        // when
        const actualCandidates = await candidateRepository.findBySessionId(-1);

        // then
        expect(actualCandidates).to.deep.equal([]);
      });
    });
  });
});
