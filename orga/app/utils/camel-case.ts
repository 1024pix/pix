export default function toCamelCase(attribute: string): string {
  return attribute.replace(/[-_](.)/g, (_, char: string) => char.toUpperCase());
}
