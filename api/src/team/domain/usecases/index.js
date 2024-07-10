import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as mailService from '../../../../lib/domain/services/mail-service.js';
import * as organizationRepository from '../../../../src/shared/infrastructure/repositories/organization-repository.js';
import * as certificationCenterRepository from '../../../certification/shared/infrastructure/repositories/certification-center-repository.js';
import * as userRepository from '../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { adminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import * as membershipRepository from '../../../shared/infrastructure/repositories/membership-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as certificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';
import { organizationInvitationRepository } from '../../infrastructure/repositories/organization-invitation.repository.js';
import { prescriberRepository } from '../../infrastructure/repositories/prescriber-repository.js';
import { userOrgaSettingsRepository } from '../../infrastructure/repositories/user-orga-settings-repository.js';
import * as certificationCenterInvitationService from '../services/certification-center-invitation-service.js';
import { organizationInvitationService } from '../services/organization-invitation.service.js';

const path = dirname(fileURLToPath(import.meta.url));

const dependencies = {
  adminMemberRepository,
  certificationCenterRepository,
  certificationCenterInvitationRepository,
  prescriberRepository,
  membershipRepository,
  userOrgaSettingsRepository,
  certificationCenterInvitationService,
  mailService,
  organizationInvitationService,
  organizationInvitationRepository,
  organizationRepository,
  userRepository,
};

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
