import * as uuid from 'node:crypto';
import { createGzip } from 'node:zlib';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import * as cpfCertificationXmlExportService from '../../../../../lib/domain/services/cpf-certification-xml-export-service.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CpfExportBuilderJob } from '../../domain/models/CpfExportBuilderJob.js';
import { usecases } from '../../domain/usecases/index.js';
import * as cpfCertificationResultRepository from '../../infrastructure/repositories/cpf-certification-result-repository.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export class CpfExportBuilderJobController extends JobController {
  constructor() {
    super(CpfExportBuilderJob.name);
  }

  async handle({
    data,
    dependencies = {
      cpfCertificationResultRepository,
      cpfCertificationXmlExportService,
      uuidService: uuid,
      logger,
    },
  }) {
    const { batchId } = data;
    const start = new Date();
    const cpfCertificationResults = await dependencies.cpfCertificationResultRepository.findByBatchId(batchId);

    if (cpfCertificationResults.length == 0) {
      dependencies.logger.error(`Create CPF results, with no certification found (batchId ${batchId})`);
      return;
    }

    const certificationCourseIds = cpfCertificationResults.map(({ id }) => id);
    dependencies.logger.info(
      `Create CPF results for ${certificationCourseIds.length} certifications (batchId ${batchId})`,
    );

    const gzipStream = createGzip();
    dependencies.cpfCertificationXmlExportService.buildXmlExport({
      cpfCertificationResults,
      writableStream: gzipStream,
      uuidService: dependencies.uuidService,
    });

    const now = dayjs().tz('Europe/Paris').format('YYYYMMDD-HHmmss');
    const filename = `pix-cpf-export-${now}.xml.gz`;
    await usecases.uploadCpfFiles({
      filename,
      readableStream: gzipStream,
      logger: dependencies.logger,
    });

    await dependencies.cpfCertificationResultRepository.markCertificationCoursesAsExported({
      certificationCourseIds,
      filename,
    });

    dependencies.logger.info(`${filename} generated in ${_getTimeInSec(start)}s.`);
  }
}

function _getTimeInSec(start) {
  return Math.floor((new Date().getTime() - start) / 1024);
}
