import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as attendanceSheetPdfUtils from '../../../session/infrastructure/utils/pdf/attendance-sheet-pdf.js';
import * as badgeRepository from '../../../../../lib/infrastructure/repositories/badge-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationCandidateRepository from '../../../shared/infrastructure/repositories/certification-candidate-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../session/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationIssueReportRepository from '../../../shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as challengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as certificationCpfCountryRepository from '../../../shared/infrastructure/repositories/certification-cpf-country-repository.js';
import * as certificationCpfCityRepository from '../../../shared/infrastructure/repositories/certification-cpf-city-repository.js';
import * as complementaryCertificationBadgesRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as complementaryCertificationRepository from '../../../../../lib/infrastructure/repositories/complementary-certification-repository.js';
import * as complementaryCertificationForTargetProfileAttachmentRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-for-target-profile-attachment-repository.js';
import * as complementaryCertificationTargetProfileHistoryRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-target-profile-history-repository.js';
import * as flashAlgorithmService from '../../../flash-certification/domain/services/algorithm-methods/flash.js';
import * as issueReportCategoryRepository from '../../../shared/infrastructure/repositories/issue-report-category-repository.js';
import * as mailService from '../services/mail-service.js';
import * as certificationCpfService from '../services/certification-cpf-service.js';
import * as organizationRepository from '../../../complementary-certification/infrastructure/repositories/organization-repository.js';
import * as sessionCodeService from '../../../session/domain/services/session-code-service.js';
import * as sessionForAttendanceSheetRepository from '../../../session/infrastructure/repositories/session-for-attendance-sheet-repository.js';
import * as sessionForInvigilatorKitRepository from '../../../session/infrastructure/repositories/session-for-invigilator-kit-repository.js';
import * as sessionRepository from '../../../session/infrastructure/repositories/session-repository.js';
import * as sessionValidator from '../../../session/domain/validators/session-validator.js';
import * as userRepository from '../../../../../src/shared/infrastructure/repositories/user-repository.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  assessmentRepository,
  attendanceSheetPdfUtils,
  badgeRepository,
  certificationCandidateRepository,
  certificationCenterRepository,
  certificationChallengeLiveAlertRepository,
  certificationCpfService,
  certificationIssueReportRepository,
  challengeRepository,
  certificationCpfCityRepository,
  certificationCpfCountryRepository,
  complementaryCertificationBadgesRepository,
  complementaryCertificationRepository,
  complementaryCertificationForTargetProfileAttachmentRepository,
  complementaryCertificationTargetProfileHistoryRepository,
  flashAlgorithmService,
  issueReportCategoryRepository,
  mailService,
  organizationRepository,
  sessionCodeService,
  sessionForAttendanceSheetRepository,
  sessionForInvigilatorKitRepository,
  sessionRepository,
  sessionValidator,
  userRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../session/domain/usecases/'),
    ignoredFileNames: ['index.js'],
  })),
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../complementary-certification/domain/usecases/'),
  })),
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../flash-certification/domain/usecases/'),
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
