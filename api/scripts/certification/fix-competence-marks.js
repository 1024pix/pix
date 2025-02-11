import 'dotenv/config';

import { knex } from '../../db/knex-database-connection.js';
import { SESSIONS_VERSIONS } from '../../src/certification/shared/domain/models/SessionVersion.js';
import { DelayMixin } from '../../src/shared/application/scripts/addons/delay.js';
import { DryRunMixin } from '../../src/shared/application/scripts/addons/dryRun.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { PIX_ORIGIN } from '../../src/shared/domain/constants.js';
import { Assessment } from '../../src/shared/domain/models/Assessment.js';

export class FixCompetenceMarksScript extends Script.withAddons(DelayMixin, DryRunMixin) {
  constructor() {
    super({
      description: 'Fix "competenceId" in table "competence-marks" from bad referential origin',
      permanent: false,
      options: {
        batchSize: {
          type: 'number',
          describe: 'Number of rows to update at once',
          demandOption: false,
          default: 1000,
        },
      },
    });

    this.totalNumberOfImpactedRows = 0;
  }

  async handle({ options, logger }) {
    this.logger = logger;
    const dryRun = options.dryRun;
    const batchSize = options.batchSize;
    const delayInMs = options.delay;
    this.logger.info(`dryRun=${dryRun} batchSize=${batchSize}`);

    let hasNext = true;
    let cursorId = 0;

    // Step 1 : get Pix core referential
    const coreReferentialCompetences = await this.getCoreReferential();

    do {
      const transaction = await knex.transaction();
      try {
        // Step 2 : get bad competences marks with bad origin
        const competenceMarksToFix = await this.getBatchOfCompetenceMarksWithBadOrigin({
          cursorId,
          batchSize,
          transaction,
        });

        // Step 3 : Find new comptence id for each bad comptences marks
        //          and match competence_code with competence marks based on competence index of referential
        const competenceMarksToUpdate = this.findNewCompetenceIdForCompetenceMarksToFix(
          coreReferentialCompetences,
          competenceMarksToFix,
        );
        // Step 4 :Update comptence mark with new comptenceId
        await this.performCompetenceMarksUpdates(competenceMarksToUpdate, transaction);
        dryRun ? await transaction.rollback() : await transaction.commit();

        // Prepare for next batch
        hasNext = competenceMarksToFix.length > 0;
        cursorId = competenceMarksToFix?.at(-1)?.id;
        this.totalNumberOfImpactedRows += competenceMarksToUpdate.length || 0;
        this.logger.debug({
          competenceMarksToFix,
          competenceMarksToUpdate,
        });
        this.logger.info({
          numberOfRowsToFix: competenceMarksToFix.length || 0,
          numberOfUpdatesCreated: competenceMarksToUpdate.length || 0,
          totalNumberOfImpactedRows: this.totalNumberOfImpactedRows,
          cursorId,
          hasNext,
        });

        this.logger.info(`Waiting ${delayInMs}ms before next batch`);
        await this.delay(delayInMs);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } while (hasNext);

    this.logger.info(
      `Number of impacted rows in competence-marsk:[${this.totalNumberOfImpactedRows}] (dryRun:[${dryRun}])`,
    );
    return 0;
  }

  async getCoreReferential() {
    return await knex('learningcontent.competences').where('learningcontent.competences.origin', '=', PIX_ORIGIN);
  }

  async getBatchOfCompetenceMarksWithBadOrigin({ cursorId, batchSize, transaction }) {
    return transaction
      .from('public.competence-marks')
      .select(
        'public.competence-marks.id',
        'public.competence-marks.competenceId',
        'public.competence-marks.competence_code',
        'learningcontent.competences.origin',
      )
      .forUpdate()
      .innerJoin('public.assessment-results', 'competence-marks.assessmentResultId', 'assessment-results.id')
      .leftJoin('learningcontent.competences', 'learningcontent.competences.id', 'public.competence-marks.competenceId')
      .innerJoin('public.assessments', 'public.assessments.id', 'public.assessment-results.assessmentId')
      .innerJoin(
        'public.certification-courses',
        'public.certification-courses.id',
        'public.assessments.certificationCourseId',
      )
      .innerJoin('public.sessions', 'public.sessions.id', 'public.certification-courses.sessionId')
      .where('public.sessions.version', '=', SESSIONS_VERSIONS.V3)
      .andWhere('public.assessments.type', '=', Assessment.types.CERTIFICATION)
      .andWhere('learningcontent.competences.origin', '!=', PIX_ORIGIN)
      .andWhere('public.competence-marks.id', '>', cursorId)
      .orderBy('public.competence-marks.id')
      .limit(batchSize);
  }

  findNewCompetenceIdForCompetenceMarksToFix(coreReferentialCompetences, competenceMarksToFix) {
    return competenceMarksToFix.map((competenceMark) => {
      const competenceIdToUpdate = coreReferentialCompetences.find(
        (coreReferentialCompetence) => coreReferentialCompetence.index === competenceMark.competence_code,
      );
      return { id: competenceMark.id, competenceId: competenceIdToUpdate.id };
    });
  }

  async performCompetenceMarksUpdates(competenceMarksToUpdate, transaction) {
    for (let index = 0; index < competenceMarksToUpdate.length; index++) {
      const updateOrder = competenceMarksToUpdate.at(index);
      if (!updateOrder.id || !updateOrder.competenceId) {
        this.logger.error({ updateOrder });
        throw new Error('There is a problem with the update order');
      }
      await transaction('public.competence-marks')
        .update({ competenceId: updateOrder.competenceId })
        .where({ id: updateOrder.id });
    }
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

await ScriptRunner.execute(import.meta.url, FixCompetenceMarksScript);
