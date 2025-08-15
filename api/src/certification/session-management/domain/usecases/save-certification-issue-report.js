import { CertificationIssueReport } from '../../../shared/domain/models/CertificationIssueReport.js';
import * as injectedIssueReportCategoryRepository from '../../../shared/infrastructure/repositories/issue-report-category-repository.js';
import { certificationIssueReportRepository as injectedCertificationIssueReportRepository } from '../../infrastructure/repositories/index.js';

const saveCertificationIssueReport = async function ({
  certificationIssueReportDTO,
  certificationIssueReportRepository = injectedCertificationIssueReportRepository,
  issueReportCategoryRepository = injectedIssueReportCategoryRepository,
} = {}) {
  const issueReportCategoryName = certificationIssueReportDTO.subcategory ?? certificationIssueReportDTO.category;

  const issueReportCategory = await issueReportCategoryRepository.get({ name: issueReportCategoryName });

  const certificationIssueReport = CertificationIssueReport.create({
    ...certificationIssueReportDTO,
    categoryId: issueReportCategory.id,
  });

  return certificationIssueReportRepository.save({ certificationIssueReport });
};

export { saveCertificationIssueReport };
