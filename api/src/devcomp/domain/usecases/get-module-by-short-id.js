import { config } from '../../../../config/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { highlightGlossaryWords } from '../services/glossary-highlighter.js';

async function getModuleByShortId({ shortId, encryptedRedirectionUrl, moduleRepository }) {
  const module = await moduleRepository.getByShortId({ shortId });
  const highlightedWordsModule = highlightGlossaryWords(module);

  if (encryptedRedirectionUrl) {
    try {
      const redirectionUrl = await cryptoService.decrypt(encryptedRedirectionUrl, config.module.secret);
      if (redirectionUrl) {
        highlightedWordsModule.setRedirectionUrl(redirectionUrl);
      }
    } catch {
      return highlightedWordsModule;
    }
  }
  return highlightedWordsModule;
}

export { getModuleByShortId };
