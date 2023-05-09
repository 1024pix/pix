import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { getSessionForSupervising } from '../../../../lib/domain/usecases/get-session-for-supervising.js';

describe('Unit | UseCase | get-session-for-supervising', function () {
  context('when the session exists', function () {
    it('should fetch and return the session from repository', async function () {
      // given
      const expectedSession = domainBuilder.buildSessionForSupervising();
      const sessionForSupervisingRepository = { get: sinon.stub() };
      sessionForSupervisingRepository.get.resolves(expectedSession);

      // when
      const actualSession = await getSessionForSupervising({ sessionId: 1, sessionForSupervisingRepository });

      // then
      expect(actualSession).to.equal(expectedSession);
    });

    context('when there are candidates', function () {
      context('when some candidates are still eligible to complementary certifications', function () {
        it("should return the session with the candidates' eligibility", async function () {
          // given
          const stillValidBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
            complementaryCertificationBadgeLabel: 'une certif complémentaire',
          });

          const retrievedSessionForSupervising = domainBuilder.buildSessionForSupervising({
            certificationCandidates: [
              domainBuilder.buildCertificationCandidateForSupervising({
                userId: 1234,
                enrolledComplementaryCertification: 'une certif complémentaire',
                stillValidBadgeAcquisitions: [],
              }),
            ],
          });

          const sessionForSupervisingRepository = { get: sinon.stub() };
          sessionForSupervisingRepository.get.resolves(retrievedSessionForSupervising);

          const certificationBadgesService = {
            findStillValidBadgeAcquisitions: sinon.stub(),
          };
          certificationBadgesService.findStillValidBadgeAcquisitions
            .withArgs({ userId: 1234 })
            .resolves([stillValidBadgeAcquisition]);

          // when
          const actualSession = await getSessionForSupervising({
            sessionId: 1,
            sessionForSupervisingRepository,
            certificationBadgesService,
          });

          // then
          expect(actualSession).to.deep.equal(
            domainBuilder.buildSessionForSupervising({
              certificationCandidates: [
                domainBuilder.buildCertificationCandidateForSupervising({
                  userId: 1234,
                  enrolledComplementaryCertification: 'une certif complémentaire',
                  stillValidBadgeAcquisitions: [stillValidBadgeAcquisition],
                }),
              ],
            })
          );
        });
      });

      context('when some candidates are not eligible to complementary certifications', function () {
        it("should return the session with the candidates' non eligibility", async function () {
          // given
          const retrievedSessionForSupervising = domainBuilder.buildSessionForSupervising({
            certificationCandidates: [
              domainBuilder.buildCertificationCandidateForSupervising({
                userId: 1234,
                enrolledComplementaryCertification: 'une certif complémentaire',
                stillValidBadgeAcquisitions: [],
              }),
            ],
          });

          const sessionForSupervisingRepository = { get: sinon.stub() };
          sessionForSupervisingRepository.get.resolves(retrievedSessionForSupervising);

          const certificationBadgesService = {
            findStillValidBadgeAcquisitions: sinon.stub(),
          };
          certificationBadgesService.findStillValidBadgeAcquisitions.withArgs({ userId: 1234 }).resolves([]);

          // when
          const actualSession = await getSessionForSupervising({
            sessionId: 1,
            sessionForSupervisingRepository,
            certificationBadgesService,
          });

          // then
          expect(actualSession).to.deep.equal(
            domainBuilder.buildSessionForSupervising({
              certificationCandidates: [
                domainBuilder.buildCertificationCandidateForSupervising({
                  userId: 1234,
                  enrolledComplementaryCertification: 'une certif complémentaire',
                  stillValidBadgeAcquisitions: [],
                }),
              ],
            })
          );
        });
      });
    });
  });
});
