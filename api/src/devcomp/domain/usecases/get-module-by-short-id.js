import { config } from '../../../../config/config.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { highlightGlossaryWords } from '../services/glossary-highlighter.js';

async function getModuleByShortId({ shortId, encryptedRedirectionUrl, moduleRepository }) {
  const module = await moduleRepository.getByShortId({ shortId });
  const moduleWithHighlightedWords = highlightGlossaryWords(module);

  if (encryptedRedirectionUrl) {
    try {
      const redirectionUrl = await cryptoService.decrypt(encryptedRedirectionUrl, config.module.secret);
      if (redirectionUrl) {
        moduleWithHighlightedWords.setRedirectionUrl(redirectionUrl);
      }
    } catch {
      return moduleWithHighlightedWords;
    }
  }
  return moduleWithHighlightedWords;
}

export { getModuleByShortId };
