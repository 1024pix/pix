import { config } from '../../../shared/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as injectedModuleRepository from '../../infrastructure/repositories/module-repository.js';

async function getModule({ slug, encryptedRedirectionUrl, moduleRepository = injectedModuleRepository } = {}) {
  const module = await moduleRepository.getBySlug({ slug });

  if (encryptedRedirectionUrl) {
    let redirectionUrl = null;
    try {
      redirectionUrl = await cryptoService.decrypt(encryptedRedirectionUrl, config.module.secret);
      if (redirectionUrl) {
        module.setRedirectionUrl(redirectionUrl);
      }
    } catch {
      return module;
    }
  }
  return module;
}

export { getModule };
