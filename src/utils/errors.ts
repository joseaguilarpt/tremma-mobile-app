type ValidationError = {
  errors: Record<string, string[]>;
  status: number;
  title: string;
  traceId: string;
  type: string;
};

export function parseErrors(errorResponse: ValidationError): string[] {
  const { errors = null } = errorResponse;
  const errorMessages: string[] = [];

  if (errors) {
    for (const key in errors) {
      if (errors[key]) {
        errorMessages.push(...errors[key]);
      }
    }
  }

  return errorMessages;
}
