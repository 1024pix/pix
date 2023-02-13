class MassImportSessionErrorManager {
  constructor() {
    this.blockingErrors = [];
    this.nonBlockingErrors = [];
  }

  addBlockingError({ line, error }) {
    const existingLine = _getExistingErrorByLine({ line, existingErrors: this.blockingErrors });

    if (existingLine) {
      _addNewErrorToLine({ existingLine, line, error });
    } else {
      this.blockingErrors.push({ [`${line}`]: [error] });
    }
  }

  addNonBlockingError({ line, error }) {
    const existingLine = _getExistingErrorByLine({ line, existingErrors: this.nonBlockingErrors });

    if (existingLine) {
      _addNewErrorToLine({ existingLine, line, error });
    } else {
      this.nonBlockingErrors.push({ [`${line}`]: [error] });
    }
  }

  get hasBlockingErrors() {
    return this.blockingErrors.length > 0;
  }
}

function _addNewErrorToLine({ existingLine, line, error }) {
  existingLine[`${line}`].push(error);
}

function _getExistingErrorByLine({ line, existingErrors }) {
  return existingErrors.find((error) => error[`${line}`]);
}

module.exports = {
  MassImportSessionErrorManager,
};
