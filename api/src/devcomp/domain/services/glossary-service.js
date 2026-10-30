const TAGS_WITHOUT_GLOSSARY_MARKER = ['a', 'button'];
const HTML_TAG_REGEX = /(<[^>]*>)/;
const OPENING_OR_CLOSING_TAG_NAME_REGEX = /^<(\/?)([a-z0-9-]+)/i;

function markGlossaryWords(module) {
  if (!module.glossary?.length) return module;

  const matcher = _buildMatcher(module.glossary);

  for (const section of module.sections) {
    for (const grain of section.grains) {
      for (const component of grain.components) {
        _processComponent(component, matcher);
      }
    }
  }

  return module;
}

function _processComponent(component, matcher) {
  if (component.type === 'element') {
    _processElement(component.element, matcher);
  } else if (component.type === 'stepper') {
    _markField(component, 'instruction', matcher);
    for (const step of component.steps) {
      for (const element of step.elements) {
        _processElement(element, matcher);
      }
    }
  }
}

function _processElement(element, matcher) {
  if (element.type === 'text') {
    _markField(element, 'content', matcher);
  }
  _markField(element, 'instruction', matcher);
  _processFeedbacks(element, matcher);
}

function _processFeedbacks(element, matcher) {
  if (element.feedback) {
    element.feedback = _markFeedback(element.feedback, matcher);
  }
  if (element.feedbacks) {
    element.feedbacks.valid = _markFeedback(element.feedbacks.valid, matcher);
    element.feedbacks.invalid = _markFeedback(element.feedbacks.invalid, matcher);
  }
  for (const proposal of element.proposals ?? []) {
    if (proposal.feedback) {
      proposal.feedback = _markFeedback(proposal.feedback, matcher);
    }
  }
}

// Feedback objects come straight from the cached learning content: copy them instead of mutating.
function _markFeedback(feedback, matcher) {
  if (typeof feedback?.diagnosis !== 'string') return feedback;
  return { ...feedback, diagnosis: _markWordsInHtml(feedback.diagnosis, matcher) };
}

function _markField(target, fieldName, matcher) {
  if (typeof target[fieldName] !== 'string') return;
  target[fieldName] = _markWordsInHtml(target[fieldName], matcher);
}

function _buildMatcher(glossary) {
  const wordsByLowerCase = new Map(
    glossary.flatMap(({ words }) => words ?? []).map((word) => [word.toLocaleLowerCase('fr'), word]),
  );
  const pattern = [...wordsByLowerCase.values()]
    .toSorted((a, b) => b.length - a.length)
    .map(_escapeRegExp)
    .join('|');

  return {
    regex: new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`, 'giu'),
    getGlossaryWord: (match) => wordsByLowerCase.get(match.toLocaleLowerCase('fr')),
  };
}

function _markWordsInHtml(html, matcher) {
  let excludedTagsDepth = 0;

  return html
    .split(HTML_TAG_REGEX)
    .map((chunk) => {
      if (HTML_TAG_REGEX.test(chunk)) {
        excludedTagsDepth += _getExcludedTagDepthDelta(chunk);
        return chunk;
      }
      if (excludedTagsDepth > 0) return chunk;

      return chunk.replace(matcher.regex, (match) => {
        const glossaryWord = _escapeHtmlAttribute(matcher.getGlossaryWord(match));
        return `<span data-glossary-word="${glossaryWord}">${match}</span>`;
      });
    })
    .join('');
}

function _getExcludedTagDepthDelta(tag) {
  const [, closingSlash, tagName] = tag.match(OPENING_OR_CLOSING_TAG_NAME_REGEX) ?? [];
  if (!tagName || !TAGS_WITHOUT_GLOSSARY_MARKER.includes(tagName.toLowerCase())) return 0;
  return closingSlash ? -1 : 1;
}

function _escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function _escapeHtmlAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export { markGlossaryWords };
