/** True if the video counts toward the bounty (default when undefined). */
export function isIncludedInBounty(
  video: { includeInBounty?: boolean }
): boolean {
  return video.includeInBounty !== false;
}
