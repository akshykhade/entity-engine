import type { EngineRegistries } from "@crud-engine/engine";

import { memberDomain } from "./member";
import { registerDomain } from "./register-domain";

export { member, members, memberDomain } from "./member";
export { type DomainDefinition, registerDomain } from "./register-domain";

export function bootstrapDomains(registries: EngineRegistries): void {
  registerDomain(memberDomain, registries);
}
