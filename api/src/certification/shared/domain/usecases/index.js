import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as badgeRepository from '../../../../../lib/infrastructure/repositories/badge-repository.js';
import * as complementaryCertificationBadgesRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as complementaryCertificationRepository from '../../../../../lib/infrastructure/repositories/complementary-certification-repository.js';
import * as complementaryCertificationForTargetProfileAttachmentRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-for-target-profile-attachment-repository.js';
import * as complementaryCertificationTargetProfileHistoryRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-target-profile-history-repository.js';
import * as issueReportCategoryRepository from '../../../shared/infrastructure/repositories/issue-report-category-repository.js';
import * as mailService from '../services/mail-service.js';
import * as organizationRepository from '../../../complementary-certification/infrastructure/repositories/organization-repository.js';
import * as sessionCodeService from '../../../session/domain/services/session-code-service.js';
import * as sessionValidator from '../../../session/domain/validators/session-validator.js';
import * as userRepository from '../../../../../src/shared/infrastructure/repositories/user-repository.js';
import * as sessionRepository from '../../../session/infrastructure/repositories/session-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../session/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  assessmentRepository,
  badgeRepository,
  certificationCenterRepository,
  certificationChallengeLiveAlertRepository,
  complementaryCertificationBadgesRepository,
  complementaryCertificationRepository,
  complementaryCertificationForTargetProfileAttachmentRepository,
  complementaryCertificationTargetProfileHistoryRepository,
  issueReportCategoryRepository,
  organizationRepository,
  sessionCodeService,
  mailService,
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
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
