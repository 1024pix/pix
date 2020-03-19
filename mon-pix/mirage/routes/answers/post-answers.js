export default function(schema) {
  const newAnswer = this.normalizedRequestAttrs();
  return schema.create('answer', { ...newAnswer, correction: schema.create('correction') });
}
