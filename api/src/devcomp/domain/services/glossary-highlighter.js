const LETTER_OR_DIGIT = String.raw`[\p{L}\p{N}]`;
const NOT_PRECEDED_BY_LETTER_OR_DIGIT = `(?<!${LETTER_OR_DIGIT})`;
const NOT_FOLLOWED_BY_LETTER_OR_DIGIT = `(?!${LETTER_OR_DIGIT})`;
const EXCLUDED_TAGS = 'a|button';
const EXCLUDED_TAG_BLOCK = String.raw`<(${EXCLUDED_TAGS})\b[^>]*>[\s\S]*?<\/\1>`;
const HTML_TAG = String.raw`(<[^>]*>)`;

export function highlightGlossaryWords(module) {
  const words = module.glossary
    .filter(({ definition }) => definition !== '')
    .flatMap(({ words, definition }) => words.map((word) => ({ word, definition })));

  if (words.length === 0) return module;

  const updatedSections = module.sections.map((section) => ({
    ...section,
    grains: section.grains.map((grain) => ({
      ...grain,
      components: grain.components.map((component) => _processComponent(component, words)),
    })),
  }));

  return { ...module, sections: updatedSections };
}

function _processComponent(component, words) {
  let componentCopy = { ...component };
  if (component.type === 'element') {
    componentCopy.element = _processElement(componentCopy.element, words);
  } else if (component.type === 'stepper') {
    componentCopy = _highlightField(componentCopy, 'instruction', words);
    componentCopy.steps = component.steps.map((step) => ({
      ...step,
      elements: step.elements.map((element) => _processElement(element, words)),
    }));
  }

  return componentCopy;
}

function _processElement(element, words) {
  let elementCopy = { ...element };
  if (element.type === 'text') {
    elementCopy = _highlightField(elementCopy, 'content', words);
  }

  elementCopy = _highlightField(elementCopy, 'instruction', words);
  elementCopy = _processFeedbacks(elementCopy, words);

  return elementCopy;
}

function _processFeedbacks(element, words) {
  const elementCopy = structuredClone(element);
  if (elementCopy.feedback) {
    elementCopy.feedback = _highlightFeedback(elementCopy.feedback, words);
  }

  if (elementCopy.feedbacks) {
    elementCopy.feedbacks.valid = _highlightFeedback(elementCopy.feedbacks.valid, words);
    elementCopy.feedbacks.invalid = _highlightFeedback(elementCopy.feedbacks.invalid, words);
  }

  for (const proposal of elementCopy.proposals ?? []) {
    if (proposal.feedback) {
      proposal.feedback = _highlightFeedback(proposal.feedback, words);
    }
  }

  return elementCopy;
}

function _highlightField(target, fieldName, words) {
  if (typeof target[fieldName] !== 'string') return target;
  const highlightedFieldName = _replaceWordsInHtml(target[fieldName], words);

  return { ...target, [fieldName]: highlightedFieldName };
}

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
