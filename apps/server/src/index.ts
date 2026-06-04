import { auth, ensurePublicRole } from "@crud-engine/auth";
import { bootstrapDomains } from "@crud-engine/domains";
import { defaultRegistries } from "@crud-engine/engine";
import { env } from "@crud-engine/env/server";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";

import { registerOpenApi } from "./openapi";
import { registerEntityRoutes } from "./routes/entity";
import { registerPermissionRoutes } from "./routes/permissions";
import { registerRoleRoutes } from "./routes/roles";

const baseCorsConfig = {
  origin: env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
};

const fastify = Fastify({
  logger: true,
});

async function start() {
  bootstrapDomains(defaultRegistries);
  await ensurePublicRole();
  await fastify.register(fastifyCors, baseCorsConfig);
  await registerOpenApi(fastify);
  await registerEntityRoutes(fastify);
  await registerRoleRoutes(fastify);
  await registerPermissionRoutes(fastify);

  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString());
        });
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
        });
        const response = await auth.handler(req);
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        fastify.log.error({ err: error }, "Authentication Error:");
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });

  fastify.get(
    "/",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check",
        response: {
          200: {
            type: "string",
            example: "OK",
          },
        },
      },
    },
    async () => {
      return "OK";
    },
  );

  await fastify.listen({ port: 3000 });
  console.log("Server running on port 3000");
  console.log("API reference available at http://localhost:3000/docs");
}

start().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
