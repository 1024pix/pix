import { config } from '../../../shared/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { highlightGlossaryWords } from '../services/GlossaryHighlighter.js';

async function getModuleByShortId({ shortId, encryptedRedirectionUrl, moduleRepository }) {
  const module = await moduleRepository.getByShortId({ shortId });

  highlightGlossaryWords(module);

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

export { getModuleByShortId };
