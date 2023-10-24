import { CertificationIssueReport } from '../../../../src/certification/shared/domain/models/CertificationIssueReport.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';

const buildCertificationIssueReport = function ({
  id = 123,
  certificationCourseId,
  categoryId,
  category = CertificationIssueReportCategory.CANDIDATE_INFORMATIONS_CHANGES,
  subcategory = CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
  description = 'Une super description',
  questionNumber = null,
  hasBeenAutomaticallyResolved = null,
  resolvedAt = null,
  resolution = null,
} = {}) {
  return new CertificationIssueReport({
    id,
    certificationCourseId,
    categoryId,
    category,
    subcategory,
    description,
    questionNumber,
    hasBeenAutomaticallyResolved,
    resolvedAt,
    resolution,
  });
};

buildCertificationIssueReport.impactful = function ({
  id,
  certificationCourseId,
  description,
  questionNumber,
  resolvedAt,
  resolution,
  hasBeenAutomaticallyResolved,
  categoryId,
} = {}) {
  return buildCertificationIssueReport({
    id,
    certificationCourseId,
    description,
    questionNumber,
    resolvedAt,
    resolution,
    categoryId,
    category: CertificationIssueReportCategory.FRAUD,
    subcategory: null,
    hasBeenAutomaticallyResolved,
  });
};

buildCertificationIssueReport.notImpactful = function ({
  id,
  certificationCourseId,
  description,
  questionNumber,
  resolvedAt,
  resolution,
  hasBeenAutomaticallyResolved,
  categoryId,
} = {}) {
  return buildCertificationIssueReport({
    id,
    certificationCourseId,
    description,
    questionNumber,
    resolvedAt,
    resolution,
    categoryId,
    category: CertificationIssueReportCategory.SIGNATURE_ISSUE,
    subcategory: null,
    hasBeenAutomaticallyResolved,
  });
};

export { buildCertificationIssueReport };
