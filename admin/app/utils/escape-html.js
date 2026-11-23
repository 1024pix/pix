import { escapeHtml as xssEscapeHtml } from 'xss';

export function escapeHtml(value) {
  return xssEscapeHtml(String(value ?? ''));
}
