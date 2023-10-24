import { CertificationIssueReport } from '../../../src/certification/shared/domain/models/CertificationIssueReport.js';

const saveCertificationIssueReport = async function ({
  certificationIssueReportDTO,
  certificationIssueReportRepository,
  issueReportCategoryRepository,
}) {
  const issueReportCategoryName = certificationIssueReportDTO.subcategory ?? certificationIssueReportDTO.category;

  const issueReportCategory = await issueReportCategoryRepository.get({ name: issueReportCategoryName });

  const certificationIssueReport = CertificationIssueReport.create({
    ...certificationIssueReportDTO,
    categoryId: issueReportCategory.id,
  });

  return certificationIssueReportRepository.save(certificationIssueReport);
};

export { saveCertificationIssueReport };
