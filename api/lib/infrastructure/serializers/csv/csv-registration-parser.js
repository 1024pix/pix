const papa = require('papaparse');
const iconv = require('iconv-lite');
const { convertDateValue } = require('../../utils/date-utils');
const { CsvImportError } = require('../../../../lib/domain/errors');

const PARSING_OPTIONS = {
  header: true,
  skipEmptyLines: 'greedy',
  transform: (value) => {
    if (typeof value === 'string') {
      value = value.trim();
      return value.length ? value : undefined;
    }
    return value;
  },
};

class CsvColumn {
  constructor({ name, label, isRequired = false, isDate = false, checkEncoding = false }) {
    this.name = name;
    this.label = label;
    this.isRequired = isRequired;
    this.isDate = isDate;
    this.checkEncoding = checkEncoding;
  }
}

class CsvRegistrationParser {

  constructor(input, organizationId, columns, registrationSet) {
    this._input = input;
    this._organizationId = organizationId;
    this._columns = columns;
    this.registrationSet = registrationSet;
  }

  parse() {
    const encoding = this._getFileEncoding();
    const { registrationLines, fields } = this._parse(encoding);

    if (!encoding) {
      throw new CsvImportError('Encodage du fichier non supporté.');
    }

    this._checkColumns(fields);
    registrationLines.forEach((line, index) => {
      const registrationAttributes = this._lineToRegistrationAttributes(line);
      try {
        this.registrationSet.addRegistration(registrationAttributes);
      } catch (err) {
        this._handleError(err, index);
      }
    });
    return this.registrationSet;
  }

  /**
   * Identify which encoding has the given file.
   * To check it, we decode and parse the first line of the file with supported encodings.
   * If there is one with at least "First name" or "Student number" correctly parsed and decoded.
   */
  _getFileEncoding() {
    const supported_encodings = ['utf-8', 'win1252', 'macintosh'];
    const checkedColumns = this._getEncodingColumns();
    for (const encoding of supported_encodings) {
      const decodedInput = iconv.decode(this._input, encoding);
      const { meta: { fields } } = papa.parse(decodedInput, { ...PARSING_OPTIONS, preview: 1 });
      if (fields.some((value) => checkedColumns.includes(value))) {
        return encoding;
      }
    }
  }

  _getEncodingColumns() {
    const checkedColumns = this._columns.filter((c) => c.checkEncoding).map((c) => c.label);
    if (checkedColumns.length === 0) {
      return this._columns.map((c) => c.label);
    }
    return checkedColumns;
  }

  _parse(encoding = 'utf8') {
    const decodedInput = iconv.decode(this._input, encoding);
    const { data: registrationLines, meta: { fields }, errors } = papa.parse(decodedInput, PARSING_OPTIONS);

    if (errors.length) {
      const hasDelimiterError = errors.some((error) => error.type === 'Delimiter');
      if (hasDelimiterError) {
        throw new CsvImportError('Le fichier doit être au format csv avec séparateur virgule ou point-virgule.');
      }
    }

    return { registrationLines, fields };
  }

  _lineToRegistrationAttributes(line) {
    const registrationAttributes = {
      organizationId: this._organizationId,
    };

    this._columns.forEach((column) => {
      const value = line[column.label];
      if (column.isDate) {
        registrationAttributes[column.name] = this._buildDateAttribute(value);
      } else {
        registrationAttributes[column.name] = value;
      }
    });

    return registrationAttributes;
  }

  _checkColumns(parsedColumns) {
    // Required columns
    const missingMandatoryColumn = this._columns
      .filter((c) => c.isRequired)
      .find((c) => !parsedColumns.includes(c.label));
    if (missingMandatoryColumn) {
      throw new CsvImportError(`La colonne "${missingMandatoryColumn.label}" est obligatoire.`);
    }

    // Expected columns
    if (this._columns.some((column) => !parsedColumns.includes(column.label))) {
      throw new CsvImportError('Les entêtes de colonnes doivent être identiques à celle du modèle.');
    }
  }

  _buildDateAttribute(dateString) {
    const convertedDate = convertDateValue({ dateString, inputFormat: 'DD/MM/YYYY', alternativeInputFormat: 'DD/MM/YY', outputFormat: 'YYYY-MM-DD' });
    return convertedDate || dateString;
  }

  _handleError(err, index) {
    const column = this._columns.find((column) => column.name === err.key);
    if (err.why === 'min_length') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit être d’au moins ${err.limit} caractères.`);
    }
    if (err.why === 'max_length') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit être inférieur à ${err.limit} caractères.`);
    }
    if (err.why === 'length') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit faire ${err.limit} caractères.`);
    }
    if (err.why === 'date_format') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit être au format jj/mm/aaaa.`);
    }
    if (err.why === 'email_format') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit être une adresse email valide.`);
    }
    if (err.why === 'required') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” est obligatoire.`);
    }
    if (err.why === 'bad_values') {
      throw new CsvImportError(`Ligne ${index + 2} : Le champ “${column.label}” doit être "${err.valids.join(' ou ')}".`);
    }
    throw err;
  }
}

module.exports = {
  CsvColumn,
  CsvRegistrationParser,
};

