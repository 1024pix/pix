import { expect, knex, sinon } from '../../../test-helper';
import _ from 'lodash';
import { main, databaseBuilder as databaseBuilderCli } from '../../../../scripts/data-generation/generate-certif-cli';
import skillRepository from '../../../../lib/infrastructure/repositories/skill-repository';
import competenceRepository from '../../../../lib/infrastructure/repositories/competence-repository';
import challengeRepository from '../../../../lib/infrastructure/repositories/challenge-repository';
import databaseBuffer from '../../../../db/database-builder/database-buffer';
// FIXME Too hard to edit \o/
describe('Integration | Scripts | generate-certif-cli.js', function () {
  const certificationCenterSup = { id: 3, type: 'SUP' };
  const certificationCenterPro = { id: 2, type: 'PRO' };
  const certificationCenterSco = {
    id: 1,
    type: 'SCO',
    externalId: 'SCOID',
  };

  beforeEach(async function () {
    sinon.stub(skillRepository, 'findActiveByCompetenceId').resolves([]);
    sinon.stub(competenceRepository, 'list').resolves([]);
    sinon.stub(challengeRepository, 'list').resolves([]);
  });

  afterEach(function () {
    //A we use the script databasebuilder, we have to clean it manually
    return databaseBuilderCli.clean();
  });

  describe('#main', function () {
    context('when asking for 2 candidates', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [certificationCenterSup, certificationCenterPro].forEach(({ id: certificationCenterId, type }) => {
        context(`when asking for ${type}`, function () {
          it(`should create 2 ${type} candidates`, async function () {
            // given
            databaseBuffer.nextId = 0;
            buildTypedCertificationCenters();
            buildComplementaryCertifications();
            await databaseBuilderCli.commit();

            // when
            await main({
              centerType: type,
              candidateNumber: 2,
              complementaryCertifications: false,
            });

            // then
            const session = await knex('sessions').select('id', 'certificationCenterId', 'accessCode').first();
            const user = await knex('users').select('id').orderBy('id', 'asc').first();
            const organizationLearner = await knex('organization-learners').select('*').orderBy('id', 'asc').first();
            const hasAuthenticationMethod = !!(await knex('authentication-methods')
              .select(1)
              .where({ userId: user.id })
              .first());
            const certificationCandidates = await knex('certification-candidates').select(
              'birthdate',
              'firstName',
              'lastName',
              'email',
              'sessionId'
            );
            expect(session.accessCode).to.exist;
            expect(session.certificationCenterId).to.equal(certificationCenterId);
            expect(hasAuthenticationMethod).to.exist;
            expect(certificationCandidates).to.have.length(2);
            const name = `${type}1`.toLowerCase();
            expect(
              _.pick(organizationLearner, ['birthdate', 'firstName', 'lastName', 'email', 'sessionId'])
            ).to.deep.equal(_.omit(certificationCandidates[0], ['sessionId']));

            expect(certificationCandidates[0]).to.deep.equals({
              birthdate: '2000-01-01',
              firstName: name,
              lastName: name,
              sessionId: session.id,
              email: `${name}@example.net`,
            });
          });

          context(`when asking for complementary certifications`, function () {
            it(`should add complementary certifications`, async function () {
              // given
              databaseBuffer.nextId = 0;
              buildTypedCertificationCenters();
              buildComplementaryCertifications();

              await databaseBuilderCli.commit();
              await databaseBuilderCli.fixSequences();

              // when
              await main({
                centerType: type,
                candidateNumber: 2,
                complementaryCertifications: [
                  { candidateNumber: 1, key: 'CLEA' },
                  { candidateNumber: 1, key: 'DROIT' },
                  { candidateNumber: 1, key: 'EDU_1ER_DEGRE' },
                  { candidateNumber: 1, key: 'EDU_2ND_DEGRE' },
                ],
              });

              // then
              const { count: habilitations } = await knex('complementary-certification-habilitations')
                .count('*')
                .first();
              const badgeAcquisitions = await knex('badge-acquisitions')
                .innerJoin('badges', 'badges.id', 'badge-acquisitions.badgeId')
                .whereIn('key', [
                  'PIX_EMPLOI_CLEA_V3',
                  'PIX_DROIT_EXPERT_CERTIF',
                  'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
                  'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME',
                ])
                .pluck('key');

              expect(badgeAcquisitions).to.deep.equal([
                'PIX_EMPLOI_CLEA_V3',
                'PIX_DROIT_EXPERT_CERTIF',
                'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
                'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME',
              ]);
              expect(habilitations).to.equal(4);
            });
          });
        });
      });

      context(`when asking for SCO`, function () {
        it('should create 2 SCO candidates', async function () {
          // given
          databaseBuffer.nextId = 0;
          buildTypedCertificationCenters();
          buildComplementaryCertifications();
          await databaseBuilderCli.commit();
          await databaseBuilderCli.fixSequences();

          // when
          await main({
            centerType: 'SCO',
            candidateNumber: 2,
            complementaryCertifications: false,
          });

          // then
          const session = await knex('sessions').select('id', 'certificationCenterId', 'accessCode').first();
          const user = await knex('users').select('id').orderBy('id', 'asc').first();
          const hasAuthenticationMethod = !!(await knex('authentication-methods')
            .select(1)
            .where({ userId: user.id })
            .first());
          const certificationCandidates = await knex('certification-candidates').select(
            'birthdate',
            'firstName',
            'lastName',
            'sessionId',
            'email'
          );

          expect(session.accessCode).to.exist;
          expect(session.certificationCenterId).to.equal(1);
          expect(hasAuthenticationMethod).to.exist;
          expect(certificationCandidates).to.have.length(2);
          expect(certificationCandidates[0]).to.deep.equals({
            birthdate: '2000-01-01',
            firstName: 'sco1',
            lastName: 'sco1',
            sessionId: session.id,
            email: 'sco1@example.net',
          });
        });

        context(`when asking for complementary certifications`, function () {
          it(`should not add complementary certifications`, async function () {
            // given
            databaseBuffer.nextId = 0;
            buildTypedCertificationCenters();
            buildComplementaryCertifications();
            await databaseBuilderCli.commit();
            await databaseBuilderCli.fixSequences();

            // when
            await main({
              centerType: 'SCO',
              candidateNumber: 2,
              complementaryCertifications: [
                { candidateNumber: 1, key: 'CLEA' },
                { candidateNumber: 1, key: 'DROIT' },
                { candidateNumber: 1, key: 'EDU_1ER_DEGRE' },
                { candidateNumber: 1, key: 'EDU_2ND_DEGRE' },
              ],
            });

            // then
            const { count: habilitations } = await knex('complementary-certification-habilitations').count('*').first();
            expect(habilitations).to.equal(0);
          });
        });
      });
    });
  });

  function buildTypedCertificationCenters() {
    databaseBuilderCli.factory.buildCertificationCenter(certificationCenterSco);
    databaseBuilderCli.factory.buildCertificationCenter(certificationCenterPro);
    databaseBuilderCli.factory.buildCertificationCenter(certificationCenterSup);
  }

  function buildComplementaryCertifications() {
    buildComplementaryCertification({
      complementaryCertificationId: 52,
      complementaryCertificationKey: 'CLEA',
      complementaryCertificationBadgeKey: 'PIX_EMPLOI_CLEA_V3',
    });
    buildComplementaryCertification({
      complementaryCertificationId: 53,
      complementaryCertificationKey: 'DROIT',
      complementaryCertificationBadgeKey: 'PIX_DROIT_EXPERT_CERTIF',
    });
    buildComplementaryCertification({
      complementaryCertificationId: 54,
      complementaryCertificationKey: 'EDU_1ER_DEGRE',
      complementaryCertificationBadgeKey: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME',
    });
    buildComplementaryCertification({
      complementaryCertificationId: 55,
      complementaryCertificationKey: 'EDU_2ND_DEGRE',
      complementaryCertificationBadgeKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME',
    });
  }

  function buildComplementaryCertification({
    complementaryCertificationId,
    complementaryCertificationKey,
    complementaryCertificationBadgeKey,
  }) {
    const { id: targetProfileId } = databaseBuilderCli.factory.buildTargetProfile();
    databaseBuilderCli.factory.buildTargetProfileSkill({ targetProfileId });

    databaseBuilderCli.factory.buildComplementaryCertification({
      id: complementaryCertificationId,
      key: complementaryCertificationKey,
    });
    const { id: badgeId } = databaseBuilderCli.factory.buildBadge({
      key: complementaryCertificationBadgeKey,
      targetProfileId,
    });
    databaseBuilderCli.factory.buildComplementaryCertificationBadge({ complementaryCertificationId, badgeId });
  }
});
