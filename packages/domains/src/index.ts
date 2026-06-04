import { registerMember } from "./member";

export { registerMember, member, members } from "./member";

export function bootstrapDomains(): void {
  registerMember();
}

bootstrapDomains();
