import { tracked } from '@glimmer/tracking';
import camelCase from 'pix-orga/utils/camel-case';

const COMMON_API_ERROR = 'common.error';

type ValidationStatus = 'default' | 'success' | 'error';

interface FieldOptions {
  validate?: (value: unknown) => boolean;
  error?: string;
  apiErrors?: Record<string, string>;
}

interface ApiError {
  attribute: string;
  message: string;
}

/**
 * Validation status and rules for a single form field.
 */
class Field {
  @tracked status: ValidationStatus = 'default';
  @tracked apiError: string | null = null;

  options: FieldOptions;

  constructor(options: FieldOptions) {
    this.options = options;
  }

  get isValid(): boolean {
    return this.status !== 'error';
  }

  get error(): string | null | undefined {
    if (this.isValid) return null;
    if (this.apiError) return this.apiError;
    return this.options.error;
  }

  validate(value: unknown): boolean {
    if (!this.options.validate) return this.isValid;

    const isValidInput = this.options.validate(value);
    this.status = isValidInput ? 'success' : 'error';
    this.apiError = null;

    return this.isValid;
  }
}

export function createFormValidation<TField extends string>(config: Record<TField, FieldOptions>) {
  const fieldNames = Object.keys(config) as TField[];

  const fields = Object.fromEntries(fieldNames.map((name) => [name, new Field(config[name])])) as Record<TField, Field>;

  const validateAll = (values: Partial<Record<TField, unknown>> = {}): boolean =>
    fieldNames.map((name) => fields[name].validate(values[name])).every(Boolean);

  const setErrorsFromApi = (errors?: ApiError[]): void => {
    if (!errors || errors.length === 0) return;

    errors.forEach(({ attribute, message }) => {
      const name = camelCase(attribute) as TField;
      const field = fieldNames.includes(name) ? fields[name] : undefined;
      if (!field) return;

      field.status = 'error';

      const { apiErrors } = field.options;
      if (apiErrors && apiErrors[message]) {
        field.apiError = apiErrors[message];
      } else {
        field.apiError = COMMON_API_ERROR;
      }
    });
  };

  return { fields, validateAll, setErrorsFromApi };
}
