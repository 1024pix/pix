/**
 * Scorers pour les evals LLM assistant.
 * Signature : (output, target, data) => number (0 ou 1)
 * - output = { toolCalls: [{ toolName, input }] }  — AI SDK v7 utilise `input` pas `args`
 * - target = { toolsToSelect?, toolsToAvoid?, requiredArgs? }
 * - data   = { messages }  (passé par Laminar pour les cas recovery)
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

// Vérifie qu'il n'y a qu'un seul appel au tool attendu (pas de doublons)
const singleToolCall = (output, target) => {
  if (!target.toolsToSelect?.length) return 1;
  const calls = output.toolCalls.filter((c) => target.toolsToSelect.includes(c.toolName));
  return calls.length <= 1 ? 1 : 0;
};

// Pour les cas recovery : vérifie que l'argument invalide a été corrigé avec une valeur
// présente dans availableValues retourné par le tool-result précédent
const recoveryFixesInvalidArg = (output, target, data) => {
  if (!data?.messages) return 1;
  const toolMessage = [...data.messages].reverse().find((m) => m.role === 'tool');
  if (!toolMessage) return 1;
  const error = toolMessage.content?.[0]?.output?.value?.error;
  if (!error?.notFound || !error?.availableValues) return 1;

  const assistantMessage = [...data.messages].reverse().find((m) => m.role === 'assistant');
  const previousInput = assistantMessage?.content?.[0]?.input ?? {};
  const invalidValue = previousInput[error.notFound];

  const newCall = output.toolCalls.find((c) => c.toolName === 'create_organization');
  if (!newCall) return 0;

  const newValue = (newCall.input ?? newCall.args ?? {})[error.notFound];
  return error.availableValues.includes(newValue) && newValue !== invalidValue ? 1 : 0;
};

// Vérifie qu'aucun argument hors-schema n'est passé à create_organization
const ALLOWED_ARGS = new Set(['name', 'type', 'administrationTeamName', 'organizationLearnerTypeName', 'countryName', 'externalId']);
const noExtraArgs = (output, target) => {
  if (!target.toolsToSelect?.includes('create_organization')) return 1;
  const call = output.toolCalls.find((c) => c.toolName === 'create_organization');
  if (!call) return 1;
  const extraKeys = Object.keys(call.input ?? {}).filter((k) => !ALLOWED_ARGS.has(k));
  return extraKeys.length === 0 ? 1 : 0;
};

// Synthèse : correct si et seulement si la sélection ET l'évitement sont tous les deux respectés
const toolSelectionScore = (output, target) => {
  return toolsSelected(output, target) === 1 && toolsAvoided(output, target) === 1 ? 1 : 0;
};

export { noExtraArgs, recoveryFixesInvalidArg, requiredArgsMatch, singleToolCall, toolsAvoided, toolSelectionScore,toolsSelected };
