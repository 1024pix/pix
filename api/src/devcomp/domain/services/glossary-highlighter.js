export function highlightGlossaryWords(module) {
  if (module.glossary.length === 0) return module;

  const words = module.glossary.flatMap(({ words }) => words);

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
  words.forEach((word) => {
    result = result.replace(new RegExp(word, 'gi'), `<span data-glossary-word="${word}">${word}</span>`);
  });

  return result;
}
