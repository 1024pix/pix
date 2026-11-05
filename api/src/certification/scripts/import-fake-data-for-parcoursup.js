import Joi from 'joi';

import { knex as datamartKnex } from '../../../datamart/knex-database-connection.js';
import { jsonFileParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
const fileSchemas = Joi.array().items(
  Joi.object({
    certificationId: Joi.number().integer().positive().required(),
    certificationCodeVerification: Joi.string().required(),
    organizationUai: Joi.string(),
    ine: Joi.string(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    middleName: Joi.string().optional().allow(null),
    thirdName: Joi.string().optional().allow(null),
    birthdate: Joi.alternatives().try(Joi.date().required(), Joi.date().iso().required()),
    status: Joi.string().required(),
    pixScore: Joi.number().required(),
    certificationDate: Joi.alternatives().try(Joi.date().required(), Joi.date().iso().required()),
    certificationIssuedAt: Joi.alternatives().try(Joi.date().required(), Joi.date().iso().required()),
    competences: Joi.array().items(
      Joi.object({
        code: Joi.string(),
        name: Joi.string(),
        level: Joi.number(),
        areaName: Joi.string(),
      }),
    ),
  }),
);

export class ImportFakeDataForParcoursup extends Script {
  constructor() {
    super({
      description:
        'Import data into the tables in the datamart. JSON file provided by ParcourSup. Intended to only be run in recette.',
      permanent: true,
      options: {
        json: {
          type: 'string',
          describe: 'JSON file path',
          demandOption: true,
          coerce: jsonFileParser(fileSchemas),
        },
        replicationTarget: {
          type: 'string',
          describe: 'The table to fill. sco_certification_results OR certification_results',
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { json, replicationTarget } = options;
    const dataToInsert = [];
    for (const item of json) {
      const rows = toDB(item, replicationTarget);
      dataToInsert.push(...rows);
    }
    await datamartKnex(replicationTarget).del();
    await datamartKnex.batchInsert(replicationTarget, dataToInsert);

    await datamartKnex('replication_metadata')
      .insert({
        replication_name: replicationTarget,
        last_updated_at: new Date(),
      })
      .onConflict(['replication_name'])
      .merge(['last_updated_at']);

    logger.info(`Script finished. Number of lines inserted : ${dataToInsert.length}, youpi`);
  }
}

function toDB(line, replicationName) {
  const dataToSave = [];
  const max_reachable_level = 7;
  const max_reachable_pix_score = 895;
  const commonData = {
    certification_courses_id: line.certificationId,
    certification_code_verification: line.certificationCodeVerification,
    last_name: line.lastName,
    first_name: line.firstName,
    birthdate: line.birthdate,
    status: line.status,
    pix_score: line.pixScore,
    certification_date: line.certificationDate,
    certification_issued_at: line.certificationIssuedAt,
    max_reachable_level,
    max_reachable_pix_score,
  };
  if (replicationName === 'sco_certification_results') {
    commonData.organization_uai = line.organizationUai;
    commonData.national_student_id = line.ine;
    commonData.middle_name = line.middleName;
    commonData.third_name = line.thirdName;
  }
  if (!line.competences || line.competences.length === 0) {
    const data = structuredClone(commonData);
    data.competence_level = null;
    data.competence_name = null;
    data.competence_code = null;
    data.area_name = null;
    dataToSave.push(data);
  }
  for (const competence of line.competences) {
    const data = structuredClone(commonData);
    data.competence_level = competence.level;
    data.competence_name = competence.name;
    data.competence_code = competence.code;
    data.area_name = competence.areaName;
    dataToSave.push(data);
  }
  return dataToSave;
}

await ScriptRunner.execute(import.meta.url, ImportFakeDataForParcoursup);
