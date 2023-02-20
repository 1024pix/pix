class CsvColumn {
  constructor({ name, property, isRequired = false, isDate = false, checkEncoding = false }) {
    this.name = name;
    this.property = property;
    this.isRequired = isRequired;
    this.isDate = isDate;
    this.checkEncoding = checkEncoding;
  }
}

export default {
  CsvColumn,
};
