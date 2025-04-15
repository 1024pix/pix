import { knex } from '../../db/knex-database-connection.js';
import { AutoJuryCommentKeys } from '../../src/certification/shared/domain/models/JuryComment.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { config } from '../../src/shared/config.js';
import { AssessmentResult } from '../../src/shared/domain/models/index.js';

export class CreateAssessmentResultForCancelledCertificationScript extends Script {
  constructor() {
    super({
      description: 'Copy certification-course.isCancelled to assessment-results table',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Commit in the database, or rollback',
          demandOption: true,
        },
        batchSize: {
          type: 'number',
          describe: 'Number of certifications to update at once',
          demandOption: false,
          default: 1000,
        },
        delayBetweenBatch: {
          type: 'number',
          describe: 'In ms, force a pause between SQL COMMIT',
          demandOption: false,
          default: 100,
        },
      },
    });

    this.totalNumberOfImpactedCertifications = 0;
  }

  async handle({ options, logger }) {
    this.logger = logger;
    const dryRun = options.dryRun;
    const batchSize = options.batchSize;
    const delayInMs = options.delayBetweenBatch;
    this.logger.info(`dryRun=${dryRun} batchSize=${batchSize}`);

    let hasNext = true;
    let cursorId = 0;

    do {
      const transaction = await knex.transaction();
      try {
        const assessmentResultsToDuplicate = await getNextCancelledAssessmentResultsToDuplicate({
          cursorId,
          batchSize,
          transaction,
        });

        for (const assessmentResult of assessmentResultsToDuplicate) {
          const newCancelledAssessmentResultId = await duplicateCancelledAssessmentResult({
            assessmentResult,
            transaction,
          });

          const competenceMarks = await getCompetenceMarks({
            assessmentResultId: assessmentResult.id,
            transaction,
          });

          for (const competenceMark of competenceMarks) {
            await duplicateCompetenceMark({
              competenceMark,
              newCancelledAssessmentResultId,
              transaction,
            });
          }
        }

        dryRun ? await transaction.rollback() : await transaction.commit();

        // Prepare for next batch
        hasNext = assessmentResultsToDuplicate.length > 0;
        cursorId = assessmentResultsToDuplicate?.at(-1)?.id;
        this.totalNumberOfImpactedCertifications += assessmentResultsToDuplicate.length || 0;

        this.logger.info(`Waiting ${delayInMs}ms before next batch`);
        await this.delay(delayInMs);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } while (hasNext);

    this.logger.info(
      `Number of impacted certifications:[${this.totalNumberOfImpactedCertifications}] (dryRun:[${dryRun}])`,
    );
    return 0;
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const getNextCancelledAssessmentResultsToDuplicate = async ({ batchSize, transaction, cursorId = 0 }) => {
  return transaction
    .from('certification-courses-last-assessment-results')
    .select('assessment-results.*')
    .forUpdate()
    .innerJoin(
      'certification-courses',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .innerJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .where('certification-courses.isCancelled', '=', true)
    .andWhere('assessment-results.status', '!=', 'cancelled')
    .andWhere('certification-courses-last-assessment-results.lastAssessmentResultId', '>', cursorId)
    .orderBy('assessment-results.id')
    .limit(batchSize);
};

const duplicateCancelledAssessmentResult = async ({ assessmentResult, transaction }) => {
  const [newAssessmentResult] = await transaction('assessment-results')
    .insert({
      level: assessmentResult.level,
      pixScore: assessmentResult.pixScore,
      commentByJury: assessmentResult.commentByJury,
      commentForOrganization: assessmentResult.commentForOrganization,
      commentForCandidate: assessmentResult.commentForCandidate,
      assessmentId: assessmentResult.assessmentId,
      reproducibilityRate: assessmentResult.reproducibilityRate,
      commentByAutoJury: getCommentByAutoJury({ commentByAutoJury: assessmentResult.commentByAutoJury }),
      status: AssessmentResult.status.CANCELLED,
      juryId: config.infra.engineeringUserId,
      createdAt: assessmentResult.createdAt,
    })
    .returning('id');

  await transaction('certification-courses-last-assessment-results')
    .update({ lastAssessmentResultId: newAssessmentResult.id })
    .where('lastAssessmentResultId', assessmentResult.id);

  return newAssessmentResult.id;
};

const duplicateCompetenceMark = async ({ competenceMark, newCancelledAssessmentResultId, transaction }) => {
  await transaction('competence-marks')
    .insert({
      level: competenceMark.level,
      score: competenceMark.score,
      area_code: competenceMark.area_code,
      competence_code: competenceMark.competence_code,
      assessmentResultId: newCancelledAssessmentResultId,
      competenceId: competenceMark.competenceId,
      createdAt: competenceMark.createdAt,
    })
    .returning('id');
};

const getCompetenceMarks = async ({ assessmentResultId, transaction }) => {
  return transaction('competence-marks').where({
    assessmentResultId,
  });
};

const getCommentByAutoJury = ({ commentByAutoJury }) => {
  const isCancelledCommentByAutoJury = [
    AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
    AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
  ].includes(commentByAutoJury);

  return isCancelledCommentByAutoJury ? commentByAutoJury : null;
};

await ScriptRunner.execute(import.meta.url, CreateAssessmentResultForCancelledCertificationScript);
