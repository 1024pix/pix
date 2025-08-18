const jscodeshift = require('jscodeshift');
const fs = require('node:fs');
const path = require('node:path');
const transform = require('./inject-dependencies-codemod');

// Mock fs to control file system interactions during tests
jest.mock('node:fs');

describe('inject-dependencies-codemod', () => {
  let mockIndexContent;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for index.js file
    mockIndexContent = `
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';
import * as complementaryCertificationBadgeRepository from '../../../certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';

const dependencies = {
  badgeRepository,
  complementaryCertificationBadgeRepository,
};

import { deleteUnassociatedBadge } from './delete-unassociated-badge.js';

const usecasesWithoutInjectedDependencies = {
  deleteUnassociatedBadge,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
    `;

    fs.existsSync.mockImplementation((filePath) => {
      return filePath.includes('index.js');
    });

    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes('index.js')) {
        return mockIndexContent;
      }
      return '';
    });
  });

  describe('Simple usecase transformation', () => {
    it('should transform a basic usecase function with dependencies', () => {
      const source = `
const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
};

export { deleteUnassociatedBadge };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      expect(result).toContain('import * as injectedBadgeRepository from');
      expect(result).toContain('badgeRepository = injectedBadgeRepository');
      expect(result).toContain('} = {})');
    });

    it('should transform arrow function usecases', () => {
      const source = `
const getInformationBanner = async ({ id, informationBannerRepository }) => {
  return informationBannerRepository.get({ id });
};

export { getInformationBanner };
      `.trim();

      mockIndexContent = `
import * as informationBannerRepository from '../../infrastructure/repositories/information-banner-repository.js';

const dependencies = {
  informationBannerRepository,
};
      `;

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/banner/domain/usecases/get-information-banner.js',
        },
      );

      expect(result).toContain('import * as injectedInformationBannerRepository from');
      expect(result).toContain('informationBannerRepository = injectedInformationBannerRepository');
    });
  });

  describe('Multiple dependencies', () => {
    it('should handle multiple dependencies in one function', () => {
      const source = `
const deleteUnassociatedBadge = async function ({ 
  badgeId, 
  badgeRepository, 
  complementaryCertificationBadgeRepository 
}) {
  const isAssociated = await badgeRepository.isAssociated(badgeId);
  const isRelatedToCertification = await complementaryCertificationBadgeRepository.isRelatedToCertification(badgeId);
  
  if (isAssociated || isRelatedToCertification) {
    throw new Error('Cannot delete');
  }
  
  return badgeRepository.remove(badgeId);
};

export { deleteUnassociatedBadge };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      expect(result).toContain('import * as injectedBadgeRepository from');
      expect(result).toContain('import * as injectedComplementaryCertificationBadgeRepository from');
      expect(result).toContain('badgeRepository = injectedBadgeRepository');
      expect(result).toContain(
        'complementaryCertificationBadgeRepository = injectedComplementaryCertificationBadgeRepository',
      );
    });
  });

  describe('Functions with existing parameters', () => {
    it('should handle functions that already have other parameters', () => {
      const source = `
const updateBadge = async function ({ badgeId, updates, badgeRepository }) {
  return badgeRepository.update(badgeId, updates);
};

export { updateBadge };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/update-badge.js',
        },
      );

      expect(result).toContain('import * as injectedBadgeRepository from');
      expect(result).toContain('badgeRepository = injectedBadgeRepository');
      expect(result).toContain('badgeId, updates'); // Other params should remain
    });
  });

  describe('Import path calculation', () => {
    it('should generate correct relative paths for different directory structures', () => {
      const source = `
const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
};

export { deleteUnassociatedBadge };
      `.trim();

      // Mock for a deeper nested structure
      mockIndexContent = `
import * as badgeRepository from '../../../evaluation/infrastructure/repositories/badge-repository.js';

const dependencies = {
  badgeRepository,
};
      `;

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/certification/scoring/domain/usecases/delete-unassociated-badge.js',
        },
      );

      expect(result).toContain('import * as injectedBadgeRepository from');
      // Should calculate relative path correctly
      expect(result).toContain('../../../evaluation/infrastructure/repositories/badge-repository.js');
    });
  });

  describe('Export detection', () => {
    it('should only transform exported functions and ignore private functions', () => {
      const source = `
const _privateHelper = async function ({ badgeRepository }) {
  return badgeRepository.getAll();
};

const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  const helper = _privateHelper({ badgeRepository });
  return badgeRepository.delete(badgeId);
};

export { deleteUnassociatedBadge };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      // Should only transform the exported function
      expect(result).toContain('import * as injectedBadgeRepository from');
      expect(result).toContain(
        'deleteUnassociatedBadge = async function({ badgeId, badgeRepository = injectedBadgeRepository',
      );

      // Private function should remain unchanged
      expect(result).toContain('_privateHelper = async function ({ badgeRepository })');
      expect(result).not.toContain('_privateHelper = async function ({ badgeRepository = injectedBadgeRepository');
    });

    it('should transform functions exported with export default', () => {
      const source = `
const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
};

export default deleteUnassociatedBadge;
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      expect(result).toContain('import * as injectedBadgeRepository from');
      expect(result).toContain('badgeRepository = injectedBadgeRepository');
    });

    it('should handle direct export declarations', () => {
      const source = `
export const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
};

const helperFunction = async function ({ badgeRepository }) {
  return badgeRepository.getAll();
};
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      // Should transform the exported function
      expect(result).toContain('import * as injectedBadgeRepository from');
      expect(result).toContain('badgeRepository = injectedBadgeRepository');

      // Should not transform the non-exported helper function
      expect(result).toContain('helperFunction = async function ({ badgeRepository })');
      expect(result).not.toContain('helperFunction = async function ({ badgeRepository = injectedBadgeRepository');
    });

    it('should handle multiple exported functions', () => {
      const source = `
const createBadge = async function ({ badgeData, badgeRepository }) {
  return badgeRepository.create(badgeData);
};

const updateBadge = async function ({ badgeId, updates, badgeRepository }) {
  return badgeRepository.update(badgeId, updates);
};

const helperFunction = async function ({ badgeRepository }) {
  return badgeRepository.getAll();
};

export { createBadge, updateBadge };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/badge-management.js',
        },
      );

      // Should transform both exported functions
      expect(result).toContain('import * as injectedBadgeRepository from');
      expect(result).toContain('createBadge = async function({ badgeData, badgeRepository = injectedBadgeRepository');
      expect(result).toContain(
        'updateBadge = async function({ badgeId, updates, badgeRepository = injectedBadgeRepository',
      );

      // Should not transform the non-exported helper function
      expect(result).toContain('helperFunction = async function ({ badgeRepository })');
      expect(result).not.toContain('helperFunction = async function ({ badgeRepository = injectedBadgeRepository');
    });

    it('should handle exported function declarations', () => {
      const source = `
export function deleteUnassociatedBadge({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
}

function helperFunction({ badgeRepository }) {
  return badgeRepository.getAll();
}
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      // Should transform the exported function declaration
      expect(result).toContain('import * as injectedBadgeRepository from');
      expect(result).toContain('deleteUnassociatedBadge({ badgeId, badgeRepository = injectedBadgeRepository');

      // Should not transform the non-exported helper function
      expect(result).toContain('helperFunction({ badgeRepository })');
      expect(result).not.toContain('helperFunction({ badgeRepository = injectedBadgeRepository');
    });

    it('should handle functions wrapped with higher-order functions like withTransaction', () => {
      const source = `
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';

const createUser = withTransaction(async function ({ userRepository, userService }) {
  return userService.create({ userRepository });
});

const helperFunction = async function ({ userRepository }) {
  return userRepository.getAll();
};

export { createUser };
      `.trim();

      mockIndexContent = `
import * as userRepository from '../../infrastructure/repositories/user-repository.js';
import * as userService from '../../../shared/domain/services/user-service.js';

const dependencies = {
  userRepository,
  userService,
};
      `;

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/identity-access-management/domain/usecases/create-user.js',
        },
      );

      // Should transform the exported function wrapped with withTransaction
      expect(result).toContain('import * as injectedUserRepository from');
      expect(result).toContain('import * as injectedUserService from');
      expect(result).toContain('userRepository = injectedUserRepository');
      expect(result).toContain('userService = injectedUserService');

      // Should not transform the non-exported helper function
      expect(result).toContain('helperFunction = async function ({ userRepository })');
      expect(result).not.toContain('helperFunction = async function ({ userRepository = injectedUserRepository');
    });

    it('should handle destructured imports (import { name }) in index.js', () => {
      const source = `
const createUser = async function ({ userToCreateRepository, cryptoService }) {
  const hashedPassword = await cryptoService.hashPassword('password');
  return userToCreateRepository.save({ hashedPassword });
};

export { createUser };
      `.trim();

      mockIndexContent = `
import * as userRepository from '../../infrastructure/repositories/user-repository.js';
import { userToCreateRepository } from '../../infrastructure/repositories/user-to-create.repository.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';

const repositories = {
  userRepository,
  userToCreateRepository,
};

const services = {
  cryptoService,
};

const dependencies = Object.assign({}, repositories, services);
      `;

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/identity-access-management/domain/usecases/create-user.js',
        },
      );

      // Should transform destructured imports correctly, preserving import style
      expect(result).toContain('import { userToCreateRepository as injectedUserToCreateRepository } from');
      expect(result).toContain('import { cryptoService as injectedCryptoService } from');
      expect(result).toContain('userToCreateRepository = injectedUserToCreateRepository');
      expect(result).toContain('cryptoService = injectedCryptoService');
    });

    it('should respect mixed import styles from index.js', () => {
      const source = `
const processUser = async function ({ userRepository, cryptoService, tokenService }) {
  return { userRepository, cryptoService, tokenService };
};

export { processUser };
      `.trim();

      mockIndexContent = `
import * as userRepository from '../../infrastructure/repositories/user-repository.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';

const repositories = {
  userRepository,
};

const services = {
  cryptoService,
  tokenService,
};

const dependencies = Object.assign({}, repositories, services);
      `;

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/process-user.js',
        },
      );

      // Should preserve original import styles
      expect(result).toContain('import * as injectedUserRepository from'); // namespace import preserved
      expect(result).toContain('import { cryptoService as injectedCryptoService } from'); // destructured preserved
      expect(result).toContain('import { tokenService as injectedTokenService } from'); // destructured preserved
      expect(result).toContain('userRepository = injectedUserRepository');
      expect(result).toContain('cryptoService = injectedCryptoService');
      expect(result).toContain('tokenService = injectedTokenService');
    });
  });

  describe('Edge cases', () => {
    it('should handle functions without parameters', () => {
      const source = `
const getAllBadges = async function () {
  return [];
};

export { getAllBadges };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/get-all-badges.js',
        },
      );

      // Should not add imports or modify the function
      expect(result).not.toContain('import * as injected');
      expect(result).toBe(source);
    });

    it('should handle functions with non-destructuring parameters', () => {
      const source = `
const processData = async function (data) {
  return data;
};

export { processData };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/process-data.js',
        },
      );

      expect(result).not.toContain('import * as injected');
      expect(result).toBe(source);
    });

    it('should handle missing index.js file gracefully', () => {
      fs.existsSync.mockReturnValue(false);

      const source = `
const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
};

export { deleteUnassociatedBadge };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      // Should return original source when no dependencies found
      expect(result).toBe(source);
    });

    it('should handle dependencies that are not in the index file', () => {
      const source = `
const processWithUnknownDep = async function ({ badgeId, unknownRepository }) {
  return unknownRepository.process(badgeId);
};

export { processWithUnknownDep };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/process-with-unknown-dep.js',
        },
      );

      // Should only process known dependencies
      expect(result).not.toContain('injectedUnknownRepository');
    });
  });

  describe('Import positioning', () => {
    it('should add imports after existing imports', () => {
      const source = `
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
};

export { deleteUnassociatedBadge };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      expect(result).toContain('import { DomainTransaction }');
      expect(result).toContain('import * as injectedBadgeRepository from');

      // Injected import should come after existing import
      const domainTransactionIndex = result.indexOf('import { DomainTransaction }');
      const injectedImportIndex = result.indexOf('import * as injectedBadgeRepository');
      expect(injectedImportIndex).toBeGreaterThan(domainTransactionIndex);
    });

    it('should add imports at the beginning when no existing imports', () => {
      const source = `
const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
};

export { deleteUnassociatedBadge };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      // Import should be at the very beginning
      expect(result.indexOf('import * as injectedBadgeRepository')).toBe(0);
    });
  });

  describe('Capitalization', () => {
    it('should correctly capitalize dependency names for injection', () => {
      const source = `
const testUsecase = async function ({ 
  userRepository, 
  organizationRepository, 
  campaignParticipationRepository 
}) {
  // logic
};

export { testUsecase };
      `.trim();

      mockIndexContent = `
import * as userRepository from '../../infrastructure/repositories/user-repository.js';
import * as organizationRepository from '../../infrastructure/repositories/organization-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';

const dependencies = {
  userRepository,
  organizationRepository,
  campaignParticipationRepository,
};
      `;

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/test-usecase.js',
        },
      );

      expect(result).toContain('injectedUserRepository');
      expect(result).toContain('injectedOrganizationRepository');
      expect(result).toContain('injectedCampaignParticipationRepository');
      expect(result).toContain('userRepository = injectedUserRepository');
      expect(result).toContain('organizationRepository = injectedOrganizationRepository');
      expect(result).toContain('campaignParticipationRepository = injectedCampaignParticipationRepository');
    });
  });

  describe('Member expression dependencies', () => {
    it('should handle dependencies that are member expressions from repositories index.js', () => {
      mockIndexContent = `
import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';

const repositories = {
  organizationForAdminRepository: organizationalEntitiesRepositories.organizationForAdminRepository,
};

const dependencies = Object.assign({}, repositories);
      `;

      const source = `
const archiveOrganizationsInBatch = async function ({ 
  organizationIds, 
  userId, 
  organizationForAdminRepository 
}) {
  await organizationForAdminRepository.archive({ id: organizationIds[0], archivedBy: userId });
};

export { archiveOrganizationsInBatch };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/organizational-entities/domain/usecases/archive-organizations-in-batch.usecase.js',
        },
      );

      // Should import the repositories object
      expect(result).toContain('import { repositories as injectedRepositories } from');
      // Should use member expression as default value
      expect(result).toContain('organizationForAdminRepository = injectedRepositories.organizationForAdminRepository');
    });

    it('should handle multiple member expression dependencies', () => {
      mockIndexContent = `
import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';
import * as regularRepository from '../../infrastructure/repositories/regular-repository.js';

const repositories = {
  organizationForAdminRepository: organizationalEntitiesRepositories.organizationForAdminRepository,
  userForAdminRepository: organizationalEntitiesRepositories.userForAdminRepository,
  regularRepository,
};

const dependencies = Object.assign({}, repositories);
      `;

      const source = `
const complexUsecase = async function ({ 
  organizationForAdminRepository, 
  userForAdminRepository,
  regularRepository
}) {
  // logic
};

export { complexUsecase };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/organizational-entities/domain/usecases/complex-usecase.js',
        },
      );

      // Should import the repositories object once
      expect(result).toContain('import { repositories as injectedRepositories } from');
      // Should import regular repository separately
      expect(result).toContain('import * as injectedRegularRepository from');

      // Should use member expressions for dependencies from repositories index
      expect(result).toContain('organizationForAdminRepository = injectedRepositories.organizationForAdminRepository');
      expect(result).toContain('userForAdminRepository = injectedRepositories.userForAdminRepository');

      // Should use regular identifier for direct dependency
      expect(result).toContain('regularRepository = injectedRegularRepository');
    });

    it('should handle spread elements in dependencies object', () => {
      // Mock the target file that enrolmentRepositories points to
      const enrolmentIndexContent = `
import * as candidateRepository from './candidate-repository.js';
import * as sessionRepository from './session-repository.js';
import * as centerRepository from './center-repository.js';

const repositoriesWithoutInjectedDependencies = {
  candidateRepository,
  sessionRepository,
  centerRepository,
};

const enrolmentRepositories = repositoriesWithoutInjectedDependencies;

export { enrolmentRepositories };
      `;

      // Override the mock to handle multiple files
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('index.js');
      });

      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('domain/usecases/index.js')) {
          return mockIndexContent;
        } else if (filePath.includes('infrastructure/repositories/index.js')) {
          return enrolmentIndexContent;
        }
        return '';
      });

      mockIndexContent = `
import { enrolmentRepositories } from '../../infrastructure/repositories/index.js';
import * as sessionValidator from '../../../shared/domain/validators/session-validator.js';

const dependencies = {
  sessionValidator,
  ...enrolmentRepositories,
};
      `;

      const source = `
const createSession = async function ({ 
  sessionValidator,
  candidateRepository  // This comes from ...enrolmentRepositories
}) {
  return sessionValidator.validate();
};

export { createSession };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/certification/enrolment/domain/usecases/create-session.js',
        },
      );

      // Should transform the direct dependency
      expect(result).toContain('import * as injectedSessionValidator from');
      expect(result).toContain('sessionValidator = injectedSessionValidator');

      // Now spread elements should be handled, so candidateRepository should be transformed
      // Check that the import path is correct (relative to the usecase file, not the repositories index)
      expect(result).toContain(
        "import * as injectedCandidateRepository from '../../infrastructure/repositories/candidate-repository.js';",
      );
      expect(result).toContain('candidateRepository = injectedCandidateRepository');
    });

    it('should handle functions with default parameter assignment pattern', () => {
      mockIndexContent = `
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';

const dependencies = {
  badgeRepository,
};
      `;

      const source = `
export async function processWithDefaults({ 
  badgeId,
  badgeRepository
} = {}) {
  return badgeRepository.process(badgeId);
};
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/process-with-defaults.js',
        },
      );

      expect(result).toContain('import * as injectedBadgeRepository from');
      expect(result).toContain('badgeRepository = injectedBadgeRepository');
    });
  });

  describe('Duplicate import prevention', () => {
    it('should not add duplicate imports when import already exists', () => {
      mockIndexContent = `
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';

const dependencies = {
  badgeRepository,
};
      `;

      const source = `
import * as injectedBadgeRepository from '../../infrastructure/repositories/badge-repository.js';

export const processWithExistingImport = ({ 
  badgeId,
  badgeRepository
}) => {
  return badgeRepository.process(badgeId);
};
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/process-with-existing-import.js',
        },
      );

      // Should not add another import
      const importMatches = result.match(/import \* as injectedBadgeRepository/g);
      expect(importMatches).toHaveLength(1); // Only one import should exist

      // Should still add the default value
      expect(result).toContain('badgeRepository = injectedBadgeRepository');
    });

    it('should handle multiple dependencies without creating duplicates', () => {
      mockIndexContent = `
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';
import * as userRepository from '../../infrastructure/repositories/user-repository.js';

const dependencies = {
  badgeRepository,
  userRepository,
};
      `;

      const source = `
import * as injectedBadgeRepository from '../../infrastructure/repositories/badge-repository.js';

export const processWithPartialImports = ({ 
  badgeId,
  userId,
  badgeRepository,
  userRepository
}) => {
  return badgeRepository.process(badgeId, userRepository.get(userId));
};
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/process-with-partial-imports.js',
        },
      );

      // Should not duplicate badgeRepository import but should add userRepository import
      const badgeImportMatches = result.match(/import \* as injectedBadgeRepository/g);
      expect(badgeImportMatches).toHaveLength(1); // Only one badge import

      const userImportMatches = result.match(/import \* as injectedUserRepository/g);
      expect(userImportMatches).toHaveLength(1); // One user import added

      // Should add default values for both
      expect(result).toContain('badgeRepository = injectedBadgeRepository');
      expect(result).toContain('userRepository = injectedUserRepository');
    });

    it('should not duplicate imports when same repository appears with different names', () => {
      mockIndexContent = `
import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';

const repositories = {
  organizationForAdminRepository: organizationalEntitiesRepositories.organizationForAdminRepository,
};

const dependencies = Object.assign({}, repositories);
      `;

      const source = `
import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';

export const archiveOrganizationsInBatch = async function({ 
  organizationIds, 
  userId, 
  organizationForAdminRepository 
}) {
  await organizationForAdminRepository.archive({ id: organizationIds[0], archivedBy: userId });
};
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/organizational-entities/domain/usecases/archive-organizations-in-batch.usecase.js',
        },
      );

      // Should not add duplicate import
      const importMatches = result.match(
        /import \{ repositories as [\w\s]+ \} from '\.\.\/\.\.\/infrastructure\/repositories\/index\.js'/g,
      );
      expect(importMatches).toHaveLength(1); // Only one import should exist

      // Should still add the default value
      expect(result).toContain(
        'organizationForAdminRepository = organizationalEntitiesRepositories.organizationForAdminRepository',
      );
    });

    it('should not create duplicate destructured imports with different aliases', () => {
      mockIndexContent = `
import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';

const repositories = {
  organizationForAdminRepository: organizationalEntitiesRepositories.organizationForAdminRepository,
};

const dependencies = Object.assign({}, repositories);
      `;

      const source = `
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

export const processWithAliasedImport = ({ 
  organizationForAdminRepository 
}) => {
  return organizationForAdminRepository.process();
};
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/organizational-entities/domain/usecases/process-with-aliased-import.js',
        },
      );

      // Should not add another import from the same path
      const importMatches = result.match(
        /import \{ repositories as [\w\s]+ \} from '\.\.\/\.\.\/infrastructure\/repositories\/index\.js'/g,
      );
      expect(importMatches).toHaveLength(1); // Only one import should exist

      // Should still add the default value using the existing imported name
      expect(result).toContain('organizationForAdminRepository = injectedRepositories.organizationForAdminRepository');
    });
  });

  describe('Import formatting', () => {
    it('should format imports with proper newlines and spacing', () => {
      mockIndexContent = `
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';
import * as userRepository from '../../infrastructure/repositories/user-repository.js';

const dependencies = {
  badgeRepository,
  userRepository,
};
      `;

      const source = `
const processMultipleDeps = async function ({ 
  badgeId,
  userId,
  badgeRepository,
  userRepository
}) {
  return badgeRepository.process(badgeId, userRepository.get(userId));
};

export { processMultipleDeps };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/process-multiple-deps.js',
        },
      );

      // Check that imports are properly separated with newlines
      expect(result).toMatch(/import \* as injectedBadgeRepository[^;]*;\nimport \* as injectedUserRepository/);

      // Check that there's proper spacing between imports and function
      expect(result).toMatch(/;\n\nconst processMultipleDeps/);

      // Check that there's proper spacing before export
      expect(result).toMatch(/;\n\nexport/);
    });

    it('should handle single import with proper formatting', () => {
      const source = `
const deleteUnassociatedBadge = async function ({ badgeId, badgeRepository }) {
  return badgeRepository.delete(badgeId);
};

export { deleteUnassociatedBadge };
      `.trim();

      const result = transform(
        source,
        { jscodeshift },
        {
          path: '/test/api/src/shared/domain/usecases/delete-unassociated-badge.js',
        },
      );

      // Check that import is followed by proper spacing
      expect(result).toMatch(/import \* as injectedBadgeRepository[^;]*;\n\nconst deleteUnassociatedBadge/);

      // Check that there's proper spacing before export
      expect(result).toMatch(/;\n\nexport/);
    });
  });
});
