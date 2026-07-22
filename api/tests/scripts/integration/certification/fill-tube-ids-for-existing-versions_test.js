import sinon from 'sinon';

import { FillTubeIdsForExistingVersions } from '../../../../scripts/certification/fill-tube-ids-for-existing-versions.js';
import { SCOPES } from '../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';
import { buildLearningContent as learningContentBuilder } from '../../../tooling/learning-content-builder/index.js';

describe('Integration | Scripts | Certification | fill-tube-ids-for-existing-versions', function () {
  let script;
  let logger;

  beforeEach(function () {
    script = new FillTubeIdsForExistingVersions();
    logger = { info: sinon.stub(), warn: sinon.stub() };
  });

  function buildTwoVersionsWithTubes() {
    const areas = [
      {
        id: 'recArea0',
        code: '66',
        competences: [
          {
            id: 'recCompetence0',
            index: '1.1',
            tubes: [
              {
                id: 'recTube0',
                skills: [
                  { id: 'recSkill0_0', challenges: [{ id: 'recChallenge0_0' }] },
                  { id: 'recSkill0_1', challenges: [{ id: 'recChallenge0_1' }] },
                ],
              },
              {
                id: 'recTube1',
                skills: [{ id: 'recSkill1_0', challenges: [{ id: 'recChallenge1_0' }] }],
              },
            ],
          },
        ],
      },
    ];
    const learningContentObjects = learningContentBuilder.fromAreas(areas);
    databaseBuilder.factory.learningContent.build(learningContentObjects);

    // the versions must be seeded WITHOUT tube rows: the script under test fills them
    const version1 = domainBuilder.certification.configuration
      .versionBuilder()
      .withParameters({ scope: SCOPES.CORE, tubeIds: [] })
      .insertToDB({ databaseBuilder });
    const version2 = domainBuilder.certification.configuration
      .versionBuilder()
      .withParameters({ scope: SCOPES.CORE, tubeIds: [] })
      .insertToDB({ databaseBuilder });
    for (const challengeId of ['recChallenge0_0', 'recChallenge0_1', 'recChallenge1_0']) {
      databaseBuilder.factory.buildCertificationFrameworksChallenge({ versionId: version1.id, challengeId });
    }
    databaseBuilder.factory.buildCertificationFrameworksChallenge({
      versionId: version2.id,
      challengeId: 'recChallenge1_0',
    });

    return { version1, version2 };
  }

  describe('#handle', function () {
    context('when dryRun is false', function () {
      it('should persist the tubes for every version', async function () {
        // given
        const { version1, version2 } = buildTwoVersionsWithTubes();
        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: false } });

        // then
        expect(logger.info.firstCall).to.have.been.calledWith('Script execution started with options {"dryRun":false}');

        const certificationVersionsTubes = await knex('certification_versions_tubes');
        expect(certificationVersionsTubes).to.have.deep.members([
          { tube_id: 'recTube0', version_id: version1.id },
          { tube_id: 'recTube1', version_id: version1.id },
          { tube_id: 'recTube1', version_id: version2.id },
        ]);

        expect(logger.info).to.have.been.calledWith(`Version ID ${version1.id} : 2 tubeIds are going to be processed`);
        expect(logger.info).to.have.been.calledWith(`Version ID ${version2.id} : 1 tubeIds are going to be processed`);
        expect(logger.info.lastCall).to.have.been.calledWith('dryRun false : a total of 3 tubeIds were added');
      });
    });

    context('when dryRun is true', function () {
      it('should not modify the database', async function () {
        // given
        const { version1, version2 } = buildTwoVersionsWithTubes();
        await databaseBuilder.commit();

        // when
        await script.handle({ logger, options: { dryRun: true } });

        // then
        expect(logger.info.firstCall).to.have.been.calledWith('Script execution started with options {"dryRun":true}');

        const certificationVersionsTubes = await knex('certification_versions_tubes');
        expect(certificationVersionsTubes.length).to.equal(0);

        expect(logger.info).to.have.been.calledWith(`Version ID ${version1.id} : 2 tubeIds are going to be processed`);
        expect(logger.info).to.have.been.calledWith(`Version ID ${version2.id} : 1 tubeIds are going to be processed`);
        expect(logger.info.lastCall).to.have.been.calledWith('dryRun true : a total of 3 tubeIds would be added');
      });
    });

    context('when an error occurs during insertion', function () {
      it('should rollback the transaction and rethrow the error', async function () {
        // given
        domainBuilder.certification.configuration
          .versionBuilder()
          .withParameters({ scope: SCOPES.CORE, tubeIds: [] })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        const dbError = new Error('DB insertion error');
        const originalTransaction = knex.transaction.bind(knex);
        let transaction;
        sinon.stub(knex, 'transaction').callsFake(async () => {
          transaction = await originalTransaction();
          sinon.stub(transaction, 'batchInsert').rejects(dbError);
          sinon.spy(transaction, 'rollback');
          return transaction;
        });

        // when / then
        await expect(script.handle({ logger, options: { dryRun: false } })).to.be.rejectedWith('DB insertion error');
        expect(transaction.rollback).to.have.been.calledOnce;

        const certificationVersionsTubes = await knex('certification_versions_tubes');
        expect(certificationVersionsTubes.length).to.equal(0);
      });
    });
  });
});
