const LETTER_OR_DIGIT = String.raw`[\p{L}\p{N}]`;
const NOT_PRECEDED_BY_LETTER_OR_DIGIT = `(?<!${LETTER_OR_DIGIT})`;
const NOT_FOLLOWED_BY_LETTER_OR_DIGIT = `(?!${LETTER_OR_DIGIT})`;
const EXCLUDED_TAGS = 'a|button';
const EXCLUDED_TAG_BLOCK = String.raw`<(${EXCLUDED_TAGS})\b[^>]*>[\s\S]*?<\/\1>`;
const HTML_TAG = String.raw`(<[^>]*>)`;
import { Module } from '../models/module/Module.js';

export function highlightGlossaryWords(module) {
  const glossaryEntries = module.glossary
    .filter(({ definition }) => definition !== '')
    .flatMap(({ words, definition }) => words.map((word) => ({ word, definition })));

  if (glossaryEntries.length === 0) return module;

  const updatedSections = module.sections.map((section) => ({
    ...section,
    grains: section.grains.map((grain) => ({
      ...grain,
      components: grain.components.map((component) => _processComponent(component, glossaryEntries)),
    })),
  }));

  return new Module({ ...module, sections: updatedSections });
}

function _processComponent(component, glossaryEntries) {
  let componentCopy = { ...component };
  if (component.type === 'element') {
    componentCopy.element = _processElement(componentCopy.element, glossaryEntries);
  } else if (component.type === 'stepper') {
    componentCopy = _highlightField(componentCopy, 'instruction', glossaryEntries);
    componentCopy.steps = component.steps.map((step) => ({
      ...step,
      elements: step.elements.map((element) => _processElement(element, glossaryEntries)),
    }));
  }

  return componentCopy;
}

function _processElement(element, glossaryEntries) {
  let elementCopy = { ...element };
  if (element.type === 'text') {
    elementCopy = _highlightField(elementCopy, 'content', glossaryEntries);
  }

  elementCopy = _highlightField(elementCopy, 'instruction', glossaryEntries);
  elementCopy = _processFeedbacks(elementCopy, glossaryEntries);

  return elementCopy;
}

function _processFeedbacks(element, glossaryEntries) {
  const elementCopy = structuredClone(element);
  if (elementCopy.feedback) {
    elementCopy.feedback = _highlightFeedback(elementCopy.feedback, glossaryEntries);
  }

  if (elementCopy.feedbacks) {
    elementCopy.feedbacks.valid = _highlightFeedback(elementCopy.feedbacks.valid, glossaryEntries);
    elementCopy.feedbacks.invalid = _highlightFeedback(elementCopy.feedbacks.invalid, glossaryEntries);
  }

  for (const proposal of elementCopy.proposals ?? []) {
    if (proposal.feedback) {
      proposal.feedback = _highlightFeedback(proposal.feedback, glossaryEntries);
    }
  }

  return elementCopy;
}

function _highlightField(target, fieldName, glossaryEntries) {
  if (typeof target[fieldName] !== 'string') return target;
  const highlightedFieldName = _replaceWordsInHtml(target[fieldName], glossaryEntries);

  return { ...target, [fieldName]: highlightedFieldName };
}

function _highlightFeedback(feedback, glossaryEntries) {
  if (typeof feedback?.diagnosis !== 'string') return feedback;
  return { ...feedback, diagnosis: _replaceWordsInHtml(feedback.diagnosis, glossaryEntries) };
}

function _replaceWordsInHtml(html, glossaryEntries) {
  let result = html;
  glossaryEntries.forEach(({ word: glossaryWord, definition }) => {
    const escapedWord = RegExp.escape(glossaryWord);
    const regex = new RegExp(
      `${EXCLUDED_TAG_BLOCK}|${HTML_TAG}|${NOT_PRECEDED_BY_LETTER_OR_DIGIT}${escapedWord}${NOT_FOLLOWED_BY_LETTER_OR_DIGIT}`,
      'giu',
    );
    result = result.replace(regex, (match, ...capturedGroups) => {
      const [excludedTag, htmlTag] = capturedGroups;
      return excludedTag || htmlTag
        ? match
        : `<highlighted-button word="${_escapeAttribute(glossaryWord)}" definition="${_escapeAttribute(definition)}">${match}</highlighted-button>`;
    });
  });

  return result;
}

function _escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
