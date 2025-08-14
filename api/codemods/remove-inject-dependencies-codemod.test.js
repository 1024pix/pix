const jscodeshift = require('jscodeshift');
const transform = require('./remove-inject-dependencies-codemod');

describe('remove-inject-dependencies-codemod', () => {
  describe('Simple transformations', () => {
    it('should transform a basic index.js file with simple dependencies', () => {
      const source = `
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as informationBannerRepository from '../../infrastructure/repositories/information-banner-repository.js';

const dependencies = {
  informationBannerRepository,
};

import { getInformationBanner } from './get-information-banner.js';

const usecasesWithoutInjectedDependencies = {
  getInformationBanner,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
      `.trim();

      const expected = `
import { getInformationBanner } from './get-information-banner.js';

const usecases = {
  getInformationBanner,
};

export { usecases };
      `.trim();

      const result = transform(source, { jscodeshift }, { path: '/test/api/src/banner/domain/usecases/index.js' });

      expect(result).toBe(expected);
    });

    it('should transform files with multiple usecase imports', () => {
      const source = `
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';
import * as userService from '../../../shared/domain/services/user-service.js';

const dependencies = {
  badgeRepository,
  userService,
};

import { createBadge } from './create-badge.js';
import { deleteBadge } from './delete-badge.js';
import { updateBadge } from './update-badge.js';

const usecasesWithoutInjectedDependencies = {
  createBadge,
  deleteBadge,
  updateBadge,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
      `.trim();

      const expected = `
import { createBadge } from './create-badge.js';
import { deleteBadge } from './delete-badge.js';
import { updateBadge } from './update-badge.js';

const usecases = {
  createBadge,
  deleteBadge,
  updateBadge,
};

export { usecases };
      `.trim();

      const result = transform(source, { jscodeshift }, { path: '/test/api/src/shared/domain/usecases/index.js' });

      expect(result).toBe(expected);
    });
  });

  describe('Complex transformations', () => {
    it('should handle complex dependencies with Object.assign', () => {
      const source = `
import { oidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js';
import * as centerRepository from '../../../certification/enrolment/infrastructure/repositories/center-repository.js';
import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { repositories as campaignRepositories } from '../../../prescription/campaign/infrastructure/repositories/index.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';

const repositories = {
  centerRepository,
  campaignRepository,
  campaignToJoinRepository: campaignRepositories.campaignToJoinRepository,
  userRepository,
};

const services = {
  cryptoService,
  tokenService,
  oidcAuthenticationServiceRegistry,
};

const dependencies = Object.assign({}, repositories, services);

import { createUser } from './create-user.usecase.js';
import { authenticateUser } from './authenticate-user.js';

const usecasesWithoutInjectedDependencies = {
  createUser,
  authenticateUser,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
      `.trim();

      const expected = `
import { createUser } from './create-user.usecase.js';
import { authenticateUser } from './authenticate-user.js';

const usecases = {
  createUser,
  authenticateUser,
};

export { usecases };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        { path: '/test/api/src/identity-access-management/domain/usecases/index.js' },
      );

      expect(result).toBe(expected);
    });

    it('should handle mixed import styles', () => {
      const source = `
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { adminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import defaultService from '../../../shared/domain/services/default-service.js';

const dependencies = {
  userRepository,
  cryptoService,
  adminMemberRepository,
  defaultService,
};

import { processUser } from './process-user.js';

const usecasesWithoutInjectedDependencies = {
  processUser,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
      `.trim();

      const expected = `
import { processUser } from './process-user.js';

const usecases = {
  processUser,
};

export { usecases };
      `.trim();

      const result = transform(source, { jscodeshift }, { path: '/test/api/src/team/domain/usecases/index.js' });

      expect(result).toBe(expected);
    });
  });

  describe('JSDoc and comments preservation', () => {
    it('should preserve JSDoc comments on usecases', () => {
      const source = `
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as informationBannerRepository from '../../infrastructure/repositories/information-banner-repository.js';

/**
 *
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {informationBannerRepository} InformationBannerRepository
 **/
const dependencies = {
  informationBannerRepository,
};

import { getInformationBanner } from './get-information-banner.js';

const usecasesWithoutInjectedDependencies = {
  getInformationBanner,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

/**
 * @typedef {dependencies} dependencies
 */
export { usecases };
      `.trim();

      const result = transform(source, { jscodeshift }, { path: '/test/api/src/banner/domain/usecases/index.js' });

      expect(result).toContain('import { getInformationBanner } from');
      expect(result).toContain('const usecases = {');
      expect(result).toContain('getInformationBanner,');
      expect(result).toContain('export { usecases };');
      expect(result).not.toContain('injectDependencies');
      expect(result).not.toContain('dependencies');
      expect(result).not.toContain('informationBannerRepository');
    });
  });

  describe('Edge cases', () => {
    it('should handle files with only usecases and no dependencies', () => {
      const source = `
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {};

import { simpleUsecase } from './simple-usecase.js';

const usecasesWithoutInjectedDependencies = {
  simpleUsecase,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
      `.trim();

      const expected = `
import { simpleUsecase } from './simple-usecase.js';

const usecases = {
  simpleUsecase,
};

export { usecases };
      `.trim();

      const result = transform(source, { jscodeshift }, { path: '/test/api/src/simple/domain/usecases/index.js' });

      expect(result).toBe(expected);
    });

    it('should skip files that are not domain/usecases/index.js', () => {
      const source = `
import { injectDependencies } from '../utils/dependency-injection.js';
import { someService } from '../services/some-service.js';

const dependencies = { someService };
const usecases = injectDependencies({}, dependencies);
export { usecases };
      `.trim();

      const result = transform(source, { jscodeshift }, { path: '/test/api/src/shared/infrastructure/index.js' });

      expect(result).toBe(source); // Should remain unchanged
    });

    it('should handle files with nested repository imports from index.js', () => {
      const source = `
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';

const dependencies = {
  userRepository,
  prescriberRepository: repositories.prescriberRepository,
};

import { manageUser } from './manage-user.js';

const usecasesWithoutInjectedDependencies = {
  manageUser,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
      `.trim();

      const expected = `
import { manageUser } from './manage-user.js';

const usecases = {
  manageUser,
};

export { usecases };
      `.trim();

      const result = transform(source, { jscodeshift }, { path: '/test/api/src/team/domain/usecases/index.js' });

      expect(result).toBe(expected);
    });

    it('should handle files already migrated (no changes needed)', () => {
      const source = `
import { getInformationBanner } from './get-information-banner.js';

const usecases = {
  getInformationBanner,
};

export { usecases };
      `.trim();

      const result = transform(source, { jscodeshift }, { path: '/test/api/src/banner/domain/usecases/index.js' });

      expect(result).toBe(source); // Should remain unchanged
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle the identity-access-management pattern', () => {
      const source = `
import { oidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js';
import * as centerRepository from '../../../certification/enrolment/infrastructure/repositories/center-repository.js';
import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { mailService } from '../../../shared/domain/services/mail-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import { userToCreateRepository } from '../../infrastructure/repositories/user-to-create.repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';

const repositories = {
  centerRepository,
  campaignRepository,
  userRepository,
  userToCreateRepository,
};

const services = {
  cryptoService,
  mailService,
  tokenService,
  oidcAuthenticationServiceRegistry,
};

const dependencies = Object.assign({}, repositories, services);

import { createUser } from './create-user.usecase.js';
import { authenticateUser } from './authenticate-user.js';
import { updateUserPassword } from './update-user-password.usecase.js';

const usecasesWithoutInjectedDependencies = {
  createUser,
  authenticateUser,
  updateUserPassword,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        { path: '/test/api/src/identity-access-management/domain/usecases/index.js' },
      );

      const expected = `
import { createUser } from './create-user.usecase.js';
import { authenticateUser } from './authenticate-user.js';
import { updateUserPassword } from './update-user-password.usecase.js';

const usecases = {
  createUser,
  authenticateUser,
  updateUserPassword,
};

export { usecases };
      `.trim();

      expect(result).toBe(expected);
    });

    it('should handle the team pattern with complex nested imports', () => {
      const source = `
import * as mailService from '../../../../src/shared/domain/services/mail-service.js';
import * as organizationRepository from '../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { adminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as membershipRepository from '../../infrastructure/repositories/membership.repository.js';

const dependencies = {
  adminMemberRepository,
  prescriberRepository: repositories.prescriberRepository,
  membershipRepository,
  organizationRepository,
  mailService,
};

import { createMembership } from './create-membership.js';
import { disableMembership } from './disable-membership.js';

const usecasesWithoutInjectedDependencies = {
  createMembership,
  disableMembership,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
      `.trim();

      const expected = `
import { createMembership } from './create-membership.js';
import { disableMembership } from './disable-membership.js';

const usecases = {
  createMembership,
  disableMembership,
};

export { usecases };
      `.trim();

      const result = transform(source, { jscodeshift }, { path: '/test/api/src/team/domain/usecases/index.js' });

      expect(result).toBe(expected);
    });
  });
});
