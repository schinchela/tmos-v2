export function memberDisplayName(member) {
  if (!member) return "";

  const name =
    member.display_name ||
    `${member.first_name || ""} ${member.last_name || ""}`.trim();

  const suffix = member.recognition_suffix || "";

  return suffix
    ? `${name}, ${suffix}`
    : name;
}

export function memberDisplayNameFromFields(
  displayName,
  recognitionSuffix
) {
  return recognitionSuffix
    ? `${displayName}, ${recognitionSuffix}`
    : displayName;
}
