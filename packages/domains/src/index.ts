import type { EngineRegistries } from "@crud-engine/engine";
import { registerMember } from "./member";

export { registerMember, member, members } from "./member";

export function bootstrapDomains(registries: EngineRegistries): void {
  registerMember(registries);
}
