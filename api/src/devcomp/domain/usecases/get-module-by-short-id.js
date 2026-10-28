import { config } from '../../../../config/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { markGlossaryWords } from '../services/glossary-service.js';

async function getModuleByShortId({ shortId, encryptedRedirectionUrl, moduleRepository }) {
  const module = await moduleRepository.getByShortId({ shortId });

  markGlossaryWords(module);

  if (encryptedRedirectionUrl) {
    try {
      const redirectionUrl = await cryptoService.decrypt(encryptedRedirectionUrl, config.module.secret);
      if (redirectionUrl) {
        module.setRedirectionUrl(redirectionUrl);
      }
    } catch {
      return module;
    }
  }
  return module;
}

export { getModuleByShortId };
