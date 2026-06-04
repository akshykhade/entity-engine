import { auth } from "@crud-engine/auth";
import type { EngineContext } from "@crud-engine/engine";
import { anonymousRoleNames, getRoleNamesForUser } from "@crud-engine/roles";
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
    return { user: undefined, roles };
  }

  const roles = await getRoleNamesForUser(session.user.id);

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      roles,
    },
    roles,
  };
}
