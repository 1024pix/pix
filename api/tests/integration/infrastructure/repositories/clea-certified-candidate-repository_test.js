import { expect, databaseBuilder, domainBuilder } from '../../../test-helper';
import cleaCertifiedCandidateRepository from '../../../../lib/infrastructure/repositories/clea-certified-candidate-repository';

describe('Integration | Repository | clea-certified-candidate-repository', function () {
  describe('#getBySessionId', function () {
    describe('when there are candidates for Clea certification in the session', function () {
      it('returns the list of clea certified candidates', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const userId = databaseBuilder.factory.buildUser({}).id;
        databaseBuilder.factory.buildCertificationCandidate({
          userId,
          sessionId,
          resultRecipientEmail: 'jean-mi@coco.fr',
        });

        const userId2 = databaseBuilder.factory.buildUser({}).id;
        databaseBuilder.factory.buildCertificationCandidate({
          userId: userId2,
          sessionId,
          resultRecipientEmail: 'marie-mi@coco.fr',
        });

        const candidateCleaSuccess = {
          firstName: 'Jean-Mi',
          lastName: 'Mi',
          birthdate: '2001-02-07',
          birthplace: 'Paris',
          sex: 'M',
          birthPostalCode: null,
          birthINSEECode: '75115',
          birthCountry: 'FRANCE',
          createdAt: new Date('2020-02-01'),
          userId,
        };
        const candidateCleaSuccess2 = {
          firstName: 'Marie',
          lastName: 'Ri',
          birthdate: '2001-02-04',
          birthplace: 'Orléans',
          sex: 'F',
          birthPostalCode: null,
          birthINSEECode: '75115',
          birthCountry: 'FRANCE',
          createdAt: new Date('2020-02-01'),
          userId: userId2,
        };

        databaseBuilder.factory.buildComplementaryCertification.clea({
          id: 1,
        });
        const badgeClea = databaseBuilder.factory.buildBadge({ id: 1, isCertifiable: true });
        const complementaryBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
          complementaryCertificationId: 1,
          badgeId: badgeClea.id,
        }).id;

        databaseBuilder.factory.buildCertificationCourse({ id: 91, sessionId, ...candidateCleaSuccess });
        databaseBuilder.factory.buildCertificationCourse({ id: 92, sessionId, ...candidateCleaSuccess2 });

        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 991,
          certificationCourseId: 91,
          complementaryCertificationId: 1,
          complementaryCertificationBadgeId: complementaryBadgeId,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 992,
          certificationCourseId: 92,
          complementaryCertificationId: 1,
          complementaryCertificationBadgeId: complementaryBadgeId,
        });

        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 991,
          acquired: true,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 992,
          acquired: true,
        });

        await databaseBuilder.commit();

        // when
        const results = await cleaCertifiedCandidateRepository.getBySessionId(sessionId);

        // then
        expect(results).to.deepEqualArray([
          domainBuilder.buildCleaCertifiedCandidate({
            firstName: 'Jean-Mi',
            lastName: 'Mi',
            resultRecipientEmail: 'jean-mi@coco.fr',
            birthdate: '2001-02-07',
            birthplace: 'Paris',
            birthPostalCode: null,
            birthINSEECode: '75115',
            birthCountry: 'FRANCE',
            sex: 'M',
            createdAt: new Date('2020-02-01'),
          }),
          domainBuilder.buildCleaCertifiedCandidate({
            firstName: 'Marie',
            lastName: 'Ri',
            resultRecipientEmail: 'marie-mi@coco.fr',
            birthdate: '2001-02-04',
            birthplace: 'Orléans',
            sex: 'F',
            birthPostalCode: null,
            birthINSEECode: '75115',
            birthCountry: 'FRANCE',
            createdAt: new Date('2020-02-01'),
          }),
        ]);
      });

      describe('when there is not certified candidates for Clea certification in the session', function () {
        it('returns the list of clea certified candidates only', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildCertificationCandidate({
            userId,
            sessionId,
            resultRecipientEmail: 'jean-mi@coco.fr',
          });
          const candidateCleaSuccess = {
            firstName: 'Jean-Mi',
            lastName: 'Mi',
            birthdate: '2001-02-07',
            birthplace: 'Paris',
            sex: 'M',
            birthPostalCode: null,
            birthINSEECode: '75115',
            birthCountry: 'FRANCE',
            createdAt: new Date('2020-02-01'),
            userId,
          };

          const candidateCleaFail = {
            firstName: 'Jean-Michou',
            lastName: 'Chou',
          };
          databaseBuilder.factory.buildComplementaryCertification.clea({
            id: 1,
          });
          const badgeClea = databaseBuilder.factory.buildBadge({ id: 1, isCertifiable: true });
          const complementaryBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
            complementaryCertificationId: 1,
            badgeId: badgeClea.id,
          }).id;

          databaseBuilder.factory.buildCertificationCourse({ id: 91, sessionId, ...candidateCleaSuccess });
          databaseBuilder.factory.buildCertificationCourse({ id: 92, sessionId, ...candidateCleaFail });

          databaseBuilder.factory.buildComplementaryCertificationCourse({
            id: 991,
            certificationCourseId: 91,
            complementaryCertificationId: 1,
            complementaryCertificationBadgeId: complementaryBadgeId,
          });
          databaseBuilder.factory.buildComplementaryCertificationCourse({
            id: 992,
            certificationCourseId: 92,
            complementaryCertificationId: 1,
            complementaryCertificationBadgeId: complementaryBadgeId,
          });

          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            complementaryCertificationCourseId: 991,
            acquired: true,
          });
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            complementaryCertificationCourseId: 992,
            acquired: false,
          });

          await databaseBuilder.commit();

          // when
          const results = await cleaCertifiedCandidateRepository.getBySessionId(sessionId);

          // then
          expect(results).to.deepEqualArray([
            domainBuilder.buildCleaCertifiedCandidate({
              firstName: 'Jean-Mi',
              lastName: 'Mi',
              resultRecipientEmail: 'jean-mi@coco.fr',
              birthdate: '2001-02-07',
              birthplace: 'Paris',
              birthPostalCode: null,
              birthINSEECode: '75115',
              birthCountry: 'FRANCE',
              sex: 'M',
              createdAt: new Date('2020-02-01'),
            }),
          ]);
        });
      });
    });

    describe('when there is no candidates for clea certification in the session', function () {
      it('returns an empty list', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;

        databaseBuilder.factory.buildCertificationCourse({ id: 91, sessionId });
        databaseBuilder.factory.buildCertificationCourse({ id: 92, sessionId });

        await databaseBuilder.commit();

        // when
        const results = await cleaCertifiedCandidateRepository.getBySessionId(sessionId);

        // then
        expect(results).to.be.empty;
      });
    });
  });
});
