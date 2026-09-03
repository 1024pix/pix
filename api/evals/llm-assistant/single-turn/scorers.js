/**
 * Scorers pour les single-turn evals.
 * Chaque scorer est une fonction `(output, target) => number` (0 ou 1, ou F1 entre 0 et 1).
 * `output` = { toolCalls: [{ toolName, input }] }  — AI SDK v7 utilise `input` pas `args`
 * `target` = { toolsToSelect?: string[], toolsToAvoid?: string[], requiredArgs?: Record }
 */

const toolsSelected = (output, target) => {
  if (!target.toolsToSelect?.length) return 1;
  const calledNames = output.toolCalls.map((c) => c.toolName);
  return target.toolsToSelect.every((name) => calledNames.includes(name))
    ? 1
    : 0;
};

const toolsAvoided = (output, target) => {
  if (!target.toolsToAvoid?.length) return 1;
  const calledNames = output.toolCalls.map((c) => c.toolName);
  return target.toolsToAvoid.every((name) => !calledNames.includes(name))
    ? 1
    : 0;
};

const requiredArgsMatch = (output, target) => {
  if (!target.requiredArgs || !Object.keys(target.requiredArgs).length)
    return 1;
  const relevantCall = output.toolCalls.find((c) =>
    target.toolsToSelect?.includes(c.toolName),
  );
  if (!relevantCall) return 0;
  const args = relevantCall.input ?? relevantCall.args ?? {};
  return Object.entries(target.requiredArgs).every(
    ([key, value]) => args[key] === value,
  )
    ? 1
    : 0;
};

const toolSelectionScore = (output, target) => {
  const selected = toolsSelected(output, target);
  const avoided = toolsAvoided(output, target);
  if (selected + avoided === 0) return 0;
  return (2 * selected * avoided) / (selected + avoided);
};

/**
 * Scorer batch: vérifie que run_script a été appelé et que le résultat contient pret >= 54.
 * `output` = { toolCalls: [...], toolResults?: [{ toolName, result }] }
 */
const lotCorrect = (output) => {
  const runScriptCall = output.toolCalls.find(
    (c) => c.toolName === "run_script",
  );
  if (!runScriptCall) return 0;
  const result = output.toolResults?.find(
    (r) => r.toolName === "run_script",
  )?.result;
  if (!result) return 1; // appel présent, résultat non fourni dans le contexte d'éval
  const pret = result?.pret ?? result?.value?.pret;
  return pret >= 54 ? 1 : 0;
};

/**
 * Scorer batch: vérifie que l'assistant a proposé des corrections dans sa réponse textuelle.
 * `output` = { toolCalls: [...], text?: string }
 */
const correctionsProposees = (output) => {
  const text = output.text ?? output.assistantText ?? "";
  const correctionKeywords = [
    "corriger",
    "correction",
    "remplacer",
    "modifier",
    "Team Alpha",
    "ligne",
  ];
  return correctionKeywords.some((kw) =>
    text.toLowerCase().includes(kw.toLowerCase()),
  )
    ? 1
    : 0;
};

/**
 * Scorer batch: vérifie que list_reference_values a été appelé avant run_script.
 */
const valeursHorsDocument = (output) => {
  const calledNames = output.toolCalls.map((c) => c.toolName);
  const listIdx = calledNames.indexOf("list_reference_values");
  const runIdx = calledNames.indexOf("run_script");
  if (listIdx === -1) return 0;
  if (runIdx === -1) return 1; // run_script pas encore appelé — list_reference_values est présent
  return listIdx < runIdx ? 1 : 0;
};

/**
 * Scorer batch: vérifie que run_script n'a PAS été appelé sans approbation explicite.
 */
const respectDuRefus = (output) => {
  const calledNames = output.toolCalls.map((c) => c.toolName);
  return calledNames.includes("run_script") ? 0 : 1;
};

export {
  correctionsProposees,
  lotCorrect,
  requiredArgsMatch,
  respectDuRefus,
  toolsAvoided,
  toolSelectionScore,
  toolsSelected,
  valeursHorsDocument,
};
