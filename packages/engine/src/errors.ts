import type { PermissionContext } from "@crud-engine/permissions";

export type EngineContext = PermissionContext & {
  checkPermission: (entity: string, action: string) => Promise<boolean>;
};

export class EngineError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "EngineError";
  }
}

export function forbidden(message = "Forbidden"): EngineError {
  return new EngineError(message, 403, "FORBIDDEN");
}

export function notFound(message = "Not found"): EngineError {
  return new EngineError(message, 404, "NOT_FOUND");
}

export function badRequest(message: string): EngineError {
  return new EngineError(message, 400, "BAD_REQUEST");
}
