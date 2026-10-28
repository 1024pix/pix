const TAGS_WITHOUT_GLOSSARY_MARKER = ['a', 'button'];
const HTML_TAG_REGEX = /(<[^>]*>)/;
const OPENING_OR_CLOSING_TAG_NAME_REGEX = /^<(\/?)([a-z0-9-]+)/i;

function highlightGlossaryWords(module) {
  if (!module.glossary?.length) return module;

  const words = module.glossary.map(({ word, definition }) => ({ word, definition }));
  const matcher = _buildMatcher(words);

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
    _highlightField(component, 'instruction', matcher);
    for (const step of component.steps) {
      for (const element of step.elements) {
        _processElement(element, matcher);
      }
    }
  }
}

function _processElement(element, matcher) {
  if (element.type === 'text') {
    _highlightField(element, 'content', matcher);
  }
  _highlightField(element, 'instruction', matcher);
  _processFeedbacks(element, matcher);
}

function _processFeedbacks(element, matcher) {
  if (element.feedback) {
    element.feedback = _highlightFeedback(element.feedback, matcher);
  }
  if (element.feedbacks) {
    element.feedbacks.valid = _highlightFeedback(element.feedbacks.valid, matcher);
    element.feedbacks.invalid = _highlightFeedback(element.feedbacks.invalid, matcher);
  }
  for (const proposal of element.proposals ?? []) {
    if (proposal.feedback) {
      proposal.feedback = _highlightFeedback(proposal.feedback, matcher);
    }
  }
}

// Feedback objects come straight from the cached learning content: copy them instead of mutating.
function _highlightFeedback(feedback, matcher) {
  if (typeof feedback?.diagnosis !== 'string') return feedback;
  return { ...feedback, diagnosis: _replaceWordsInHtml(feedback.diagnosis, matcher) };
}

function _highlightField(target, fieldName, matcher) {
  if (typeof target[fieldName] !== 'string') return;
  target[fieldName] = _replaceWordsInHtml(target[fieldName], matcher);
}

function _buildMatcher(words) {
  const entriesByLowerCase = new Map(words.map((entry) => [entry.word.toLocaleLowerCase('fr'), entry]));
  const pattern = [...entriesByLowerCase.values()]
    .map(({ word }) => word)
    .toSorted((a, b) => b.length - a.length)
    .map(_escapeRegExp)
    .join('|');

  return {
    regex: new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`, 'giu'),
    getEntry: (match) => entriesByLowerCase.get(match.toLocaleLowerCase('fr')),
  };
}

function _replaceWordsInHtml(html, matcher) {
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
        const { word, definition } = matcher.getEntry(match);
        return `<highlighted-button word="${_escapeHtmlAttribute(word)}" definition="${_escapeHtmlAttribute(definition ?? '')}">${match}</highlighted-button>`;
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

export { highlightGlossaryWords };
