import swagger from "@fastify/swagger";
import scalarApiReference from "@scalar/fastify-api-reference";
import type { FastifyInstance } from "fastify";

export async function registerOpenApi(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "CRUD Engine API",
        description:
          "Generic entity CRUD API powered by the ERP entity engine. Drizzle is an implementation detail — routes operate on entity registry metadata.",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development",
        },
      ],
      tags: [
        {
          name: "Entity Engine",
          description: "Metadata-driven CRUD operations",
        },
        {
          name: "Permissions",
          description: "Central permission matrix and user permission evaluation",
        },
        {
          name: "Health",
          description: "Service health checks",
        },
      ],
    },
  });

  await fastify.register(scalarApiReference, {
    routePrefix: "/docs",
    configuration: {
      title: "CRUD Engine API",
    },
  });
}
