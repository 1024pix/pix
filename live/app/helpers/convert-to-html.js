import Ember from 'ember';

export function convertToHtml(params) {
  let rules = SimpleMarkdown.defaultRules; // for example

  let parser = SimpleMarkdown.parserFor(rules);
  let htmlOutput = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(rules, 'html'));

  let blockParseAndOutput = function(source) {
    let blockSource = source + "\n\n";
    let parseTree = parser(blockSource, {inline: false});
    let outputResult = htmlOutput(parseTree);
    return outputResult;
  };

  return blockParseAndOutput(params);
}

export default Ember.Helper.helper(convertToHtml);
