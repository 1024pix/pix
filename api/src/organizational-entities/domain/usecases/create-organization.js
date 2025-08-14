import * as injectedSchoolRepository from '../../../school/infrastructure/repositories/school-repository.js';
import * as injectedCodeGenerator from '../../../shared/domain/services/code-generator.js';
import * as injectedDataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer.repository.js';
import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';
import { Organization } from '../models/Organization.js';
import * as injectedOrganizationCreationValidator from '../validators/organization-creation-validator.js';

const createOrganization = async function ({
  organization,
  dataProtectionOfficerRepository = injectedDataProtectionOfficerRepository,
  organizationForAdminRepository = organizationalEntitiesRepositories.organizationForAdminRepository,
  organizationCreationValidator = injectedOrganizationCreationValidator,
  schoolRepository = injectedSchoolRepository,
  codeGenerator = injectedCodeGenerator,
} = {}) {
  organizationCreationValidator.validate(organization);
  const savedOrganization = await organizationForAdminRepository.save({ organization });

  await dataProtectionOfficerRepository.create({
    organizationId: savedOrganization.id,
    firstName: organization.dataProtectionOfficer.firstName,
    lastName: organization.dataProtectionOfficer.lastName,
    email: organization.dataProtectionOfficer.email,
  });

  if (savedOrganization.type === Organization.types.SCO1D) {
    const code = await codeGenerator.generate(schoolRepository);
    await schoolRepository.save({ organizationId: savedOrganization.id, code });
  }
  return await organizationForAdminRepository.get({ organizationId: savedOrganization.id });
};

export { createOrganization };
