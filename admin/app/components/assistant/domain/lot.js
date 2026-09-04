class ToolCall {
  constructor({ index, sourceRow, name, args }) {
    this.index = index;
    this.sourceRow = sourceRow;
    this.name = name;
    this.args = args;
    this.verdict = null;
    this.result = null;
  }

  simulate(result) {
    this.result = result;
    this.verdict = (result.error !== undefined || result.errors !== undefined) ? 'error' : 'ready';
  }

  markAsDuplicate() {
    this.verdict = 'duplicate';
  }

  exclude() {
    this.verdict = 'excluded';
  }

  execute(result) {
    this.result = result;
  }
}

export default class Batch {
  constructor() {
    this.calls = [];
    this.state = 'pending';
    this.document = null;
  }

  addCall({ sourceRow, name, args }) {
    if (this.state !== 'pending') {
      throw new Error('addCall forbidden: batch not in pending state');
    }
    const index = this.calls.length + 1;
    const call = new ToolCall({ index, sourceRow, name, args });
    this.calls.push(call);
  }

  recordSimulationResult(index, result) {
    const call = this.calls.find((c) => c.index === index);
    call.simulate(result);

    // Mark duplicates: keep first occurrence (by index), flag all subsequent ones.
    // Runs incrementally — only looks at calls that have a verdict.
    const seenExternalIds = new Map();
    for (const c of this.calls) {
      if (c.verdict === null) continue;
      const id = c.args.externalId;
      if (id == null || id === '') continue;
      if (seenExternalIds.has(id)) {
        c.markAsDuplicate();
      } else {
        seenExternalIds.set(id, c);
      }
    }
  }

  finishSimulation() {
    const incomplete = this.calls.some((c) => c.verdict === null);
    if (incomplete) {
      throw new Error('simulation-incomplete: all calls must have a verdict');
    }
    this.state = 'simulated';
  }

  approve() {
    const hasBlockingIssue = this.calls.some((c) => c.verdict === 'error' || c.verdict === 'duplicate');
    if (hasBlockingIssue) {
      throw new Error('batch-has-unresolved-errors');
    }
    this.state = 'approved';
  }

  callsToExecute() {
    if (this.state !== 'approved' && this.state !== 'running') {
      throw new Error('callsToExecute forbidden: batch not in approved or running state');
    }
    // Exclude calls already created (result.id defined) to prevent double-creation on resume
    return this.calls.filter((c) => c.verdict === 'ready' && c.result?.id === undefined);
  }

  startExecution() {
    this.state = 'running';
  }

  recordExecutionResult(index, result) {
    const call = this.calls.find((c) => c.index === index);
    // Do not overwrite if already executed (has an id result)
    if (call.result && call.result.id !== undefined) {
      return;
    }
    call.execute(result);

    // Check if all ready calls are now executed
    const readyCalls = this.calls.filter((c) => c.verdict === 'ready');
    const allDone = readyCalls.every((c) => c.result && c.result.id !== undefined);
    if (allDone && readyCalls.length > 0) {
      this.state = 'done';
    }
  }
}
