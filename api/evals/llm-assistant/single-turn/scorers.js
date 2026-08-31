/**
 * Scorers pour les single-turn evals.
 * Chaque scorer est une fonction `(output, target) => number` (0 ou 1, ou F1 entre 0 et 1).
 * `output` = { toolCalls: [{ toolName, input }] }  — AI SDK v7 utilise `input` pas `args`
 * `target` = { toolsToSelect?: string[], toolsToAvoid?: string[], requiredArgs?: Record }
 */

const toolsSelected = (output, target) => {
  if (!target.toolsToSelect?.length) return 1;
  const calledNames = output.toolCalls.map((c) => c.toolName);
  return target.toolsToSelect.every((name) => calledNames.includes(name)) ? 1 : 0;
};

const toolsAvoided = (output, target) => {
  if (!target.toolsToAvoid?.length) return 1;
  const calledNames = output.toolCalls.map((c) => c.toolName);
  return target.toolsToAvoid.every((name) => !calledNames.includes(name)) ? 1 : 0;
};

const requiredArgsMatch = (output, target) => {
  if (!target.requiredArgs || !Object.keys(target.requiredArgs).length) return 1;
  const relevantCall = output.toolCalls.find((c) => target.toolsToSelect?.includes(c.toolName));
  if (!relevantCall) return 0;
  const args = relevantCall.input ?? relevantCall.args ?? {};
  return Object.entries(target.requiredArgs).every(([key, value]) => args[key] === value) ? 1 : 0;
};

const toolSelectionScore = (output, target) => {
  const selected = toolsSelected(output, target);
  const avoided = toolsAvoided(output, target);
  if (selected + avoided === 0) return 0;
  return (2 * selected * avoided) / (selected + avoided);
};

export { requiredArgsMatch, toolsAvoided, toolSelectionScore,toolsSelected };
