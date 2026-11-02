const LETTER_OR_DIGIT = String.raw`[\p{L}\p{N}]`;
const NOT_PRECEDED_BY_LETTER_OR_DIGIT = `(?<!${LETTER_OR_DIGIT})`;
const NOT_FOLLOWED_BY_LETTER_OR_DIGIT = `(?!${LETTER_OR_DIGIT})`;
const EXCLUDED_TAGS = 'a|button';
const EXCLUDED_TAG_BLOCK = String.raw`<(${EXCLUDED_TAGS})\b[^>]*>[\s\S]*?<\/\1>`;
const HTML_TAG = String.raw`(<[^>]*>)`;

export function highlightGlossaryWords(module) {
  if (module.glossary.length === 0) return module;

  const words = module.glossary.flatMap(({ words, definition }) => words.map((word) => ({ word, definition })));

  for (const section of module.sections) {
    for (const grain of section.grains) {
      for (const component of grain.components) {
        _processComponent(component, words);
      }
    }
  }

  return module;
}

function _processComponent(component, words) {
  if (component.type === 'element') {
    _processElement(component.element, words);
  } else if (component.type === 'stepper') {
    _highlightField(component, 'instruction', words);
    for (const step of component.steps) {
      for (const element of step.elements) {
        _processElement(element, words);
      }
    }
  }
}

function _processElement(element, words) {
  if (element.type === 'text') {
    _highlightField(element, 'content', words);
  }

  _highlightField(element, 'instruction', words);

  _processFeedbacks(element, words);
}

function _processFeedbacks(element, words) {
  if (element.feedback) {
    element.feedback = _highlightFeedback(element.feedback, words);
  }

  if (element.feedbacks) {
    element.feedbacks.valid = _highlightFeedback(element.feedbacks.valid, words);
    element.feedbacks.invalid = _highlightFeedback(element.feedbacks.invalid, words);
  }

  for (const proposal of element.proposals ?? []) {
    if (proposal.feedback) {
      proposal.feedback = _highlightFeedback(proposal.feedback, words);
    }
  }
}

function _highlightField(target, fieldName, words) {
  if (typeof target[fieldName] !== 'string') return;
  target[fieldName] = _replaceWordsInHtml(target[fieldName], words);
}

// Feedback objects come straight from the cached learning content: copy them instead of mutating.
function _highlightFeedback(feedback, words) {
  if (typeof feedback?.diagnosis !== 'string') return feedback;
  return { ...feedback, diagnosis: _replaceWordsInHtml(feedback.diagnosis, words) };
}

function _replaceWordsInHtml(html, words) {
  let result = html;
  words.forEach(({ word: glossaryWord, definition }) => {
    const escapedWord = RegExp.escape(glossaryWord);
    const regex = new RegExp(
      `${EXCLUDED_TAG_BLOCK}|${HTML_TAG}|${NOT_PRECEDED_BY_LETTER_OR_DIGIT}${escapedWord}${NOT_FOLLOWED_BY_LETTER_OR_DIGIT}`,
      'giu',
    );
    result = result.replace(regex, (match, excludedTag, htmlTag) =>
      excludedTag || htmlTag
        ? match
        : `<highlighted-button word="${_escapeAttribute(glossaryWord)}" definition="${_escapeAttribute(definition)}">${match}</highlighted-button>`,
    );
  });

  return result;
}

function _escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
