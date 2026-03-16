/** Video category options for add/edit forms and display */
export const VIDEO_CATEGORIES = [
  { value: "", label: "—" },
  { value: "Monthly Match", label: "Monthly Match" },
  { value: "Course Conquest", label: "Course Conquest" },
  { value: "Disc Golf Challenge", label: "Disc Golf Challenge" },
  { value: "Disc Golf Punishment", label: "Disc Golf Punishment" },
  { value: "Break 69 Challenge", label: "Break 69 Challenge" },
  { value: "All-Star Event", label: "All-Star Event" },
] as const;

export type VideoCategoryValue = (typeof VIDEO_CATEGORIES)[number]["value"];
