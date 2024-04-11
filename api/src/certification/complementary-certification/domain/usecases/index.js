// eslint-disable import/no-restricted-paths
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as complementaryCertificationForTargetProfileAttachmentRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-for-target-profile-attachment-repository.js';
import * as organizationRepository from '../../../complementary-certification/infrastructure/repositories/organization-repository.js';
import { mailService } from '../../../shared/domain/services/mail-service.js';
import * as complementaryCertificationBadgesRepository from '../../infrastructure/repositories/complementary-certification-badge-repository.js';
import * as complementaryCertificationRepository from '../../infrastructure/repositories/complementary-certification-repository.js';
import * as targetProfileHistoryRepository from '../../infrastructure/repositories/target-profile-history-repository.js';

/**
 *
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {complementaryCertificationBadgesRepository} ComplementaryCertificationBadgesRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {complementaryCertificationForTargetProfileAttachmentRepository} ComplementaryCertificationForTargetProfileAttachmentRepository
 * @typedef {targetProfileHistoryRepository} TargetProfileHistoryRepository
 * @typedef {organizationRepository} OrganizationRepository
 * @typedef {mailService} MailService
 **/
const dependencies = {
  complementaryCertificationBadgesRepository,
  complementaryCertificationRepository,
  complementaryCertificationForTargetProfileAttachmentRepository,
  targetProfileHistoryRepository,
  organizationRepository,
  mailService,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: 'index.js',
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

/**
 * @typedef {dependencies} dependencies
 */
export { usecases };
