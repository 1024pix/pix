function highlightGlossaryWords(module) {
  if (!module.glossary?.length) return module;

  const words = module.glossary.map((entry) => entry.word);

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
    for (const step of component.steps) {
      for (const element of step.elements) {
        _processElement(element, words);
      }
    }
  }
}

function _processElement(element, words) {
  if (element.type === 'text') {
    element.content = _replaceWordsInHtml(element.content, words);
  }
}

function _replaceWordsInHtml(html, words) {
  const escapedWords = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = escapedWords.join('|');
  const regex = new RegExp(`(<[^>]*>)|(\\b(?:${pattern})\\b)`, 'gi');

  return html.replace(regex, (match, htmlTag) => {
    if (htmlTag) return htmlTag;
    return `<button class="module-glossary-word">${match}</button>`;
  });
}

export { highlightGlossaryWords };
