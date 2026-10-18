import { BUSINESS_NAME_REGEX } from "./constants";

export const isValidBusinessName = (name: string) => {
  return BUSINESS_NAME_REGEX.test(name.trim());
};

export const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      parsed.hostname.includes(".")
    );
  } catch {
    return false;
  }
};

export const isValidExternalLinks = (links: string) => {
  if (!links.trim()) return true;

  return links
    .split(/\n|,/)
    .map((link) => link.trim())
    .filter(Boolean)
    .every(isValidUrl);
};