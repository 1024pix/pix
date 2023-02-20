import CertificationIssueReport from '../models/CertificationIssueReport';

export default async function saveCertificationIssueReport({
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
}
