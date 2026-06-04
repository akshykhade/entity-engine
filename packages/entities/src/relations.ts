export type LinkRelation = {
  type: "link";
  /** Target entity registry name (e.g. Member). */
  entity: string;
  label?: string;
};

export type RelationDefinition = LinkRelation;

export function link(meta: Omit<LinkRelation, "type">): LinkRelation {
  return { type: "link", ...meta };
}
