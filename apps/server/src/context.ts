import {
  anonymousRoleNames,
  auth,
  getRoleNamesForUser,
} from "@crud-engine/auth";
import type { EngineContext } from "@crud-engine/engine";
import { permissionRegistry } from "@crud-engine/permissions";
import type { FastifyRequest } from "fastify";

function requestHeaders(request: FastifyRequest): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (value) {
      headers.append(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  return headers;
}

export async function createEngineContext(
  request: FastifyRequest,
): Promise<EngineContext> {
  const session = await auth.api.getSession({
    headers: requestHeaders(request),
  });

  if (!session?.user) {
    const roles = anonymousRoleNames();
    const ctx: EngineContext = {
      user: undefined,
      roles,
      checkPermission: (entity, action) =>
        permissionRegistry.checkPermission({ user: undefined, roles }, entity, action),
    };
    return ctx;
  }

  const roles = await getRoleNamesForUser(session.user.id);
  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    roles,
  };
  const ctx: EngineContext = {
    user,
    roles,
    checkPermission: (entity, action) =>
      permissionRegistry.checkPermission({ user, roles }, entity, action),
  };
  return ctx;
}
