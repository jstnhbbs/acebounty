"use client";

import type { Video } from "@/lib/db";
import { getBountyAfterEachVideo } from "@/lib/bounty";
import { isIncludedInBounty } from "@/lib/video";
import { VIDEO_CATEGORIES } from "@/lib/video-categories";
import { useMemo, useState } from "react";
import { VideoList } from "./VideoList";

const ALL_YEARS = "all";
const ALL_MONTHS = "all";
const ALL_CATEGORIES = "all";

const MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getYearsFromVideos(videos: Video[]): number[] {
  const years = new Set(
    videos.map((v) => new Date(v.publishedAt).getFullYear())
  );
  return Array.from(years).sort((a, b) => b - a);
}

function getDefaultYearAndMonth(years: number[]) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const yearInList = years.includes(currentYear);
  return {
    year: yearInList ? String(currentYear) : ALL_YEARS,
    month: yearInList ? String(currentMonth) : ALL_MONTHS,
  };
}

export function HistoryWithYearFilter({
  videos,
  spoilerCutoffMs,
}: {
  videos: Video[];
  spoilerCutoffMs: number;
}) {
  const years = useMemo(() => getYearsFromVideos(videos), [videos]);
  const defaults = useMemo(() => getDefaultYearAndMonth(years), [years]);
  const [selectedYear, setSelectedYear] = useState<string>(defaults.year);
  const [selectedMonth, setSelectedMonth] = useState<string>(defaults.month);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);

  const videosForBounty = videos.filter(isIncludedInBounty);
  const bountyAfter = useMemo(
    () => getBountyAfterEachVideo(videosForBounty),
    [videosForBounty]
  );

  const filteredVideos = useMemo(() => {
    let list = videos;
    if (selectedYear !== ALL_YEARS) {
      list = list.filter(
        (v) => new Date(v.publishedAt).getFullYear() === Number(selectedYear)
      );
    }
    if (selectedMonth !== ALL_MONTHS) {
      list = list.filter(
        (v) => new Date(v.publishedAt).getMonth() + 1 === Number(selectedMonth)
      );
    }
    if (selectedCategory !== ALL_CATEGORIES) {
      list = list.filter(
        (v) => (v as { category?: string | null }).category === selectedCategory
      );
    }
    return list;
  }, [videos, selectedYear, selectedMonth, selectedCategory]);

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    if (value === ALL_YEARS) setSelectedMonth(ALL_MONTHS);
  };

  const yearFilterActive = selectedYear !== ALL_YEARS;
  const monthFilterActive = selectedMonth !== ALL_MONTHS;
  const categoryFilterActive = selectedCategory !== ALL_CATEGORIES;

  const categoryOptions = useMemo(
    () => VIDEO_CATEGORIES.filter((c) => c.value !== ""),
    []
  );

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="history-year" className="font-medium text-foreground">
            Year
          </label>
          <select
            id="history-year"
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="form-input w-full"
            aria-label="Filter by year"
          >
            <option value={ALL_YEARS}>All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="history-month" className="font-medium text-foreground">
            Month
          </label>
          <select
            id="history-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={!yearFilterActive}
            className="form-input w-full disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Filter by month"
          >
            <option value={ALL_MONTHS}>All months</option>
            {MONTH_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="history-category" className="font-medium text-foreground">
            Category
          </label>
          <select
            id="history-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input w-full"
            aria-label="Filter by category"
          >
            <option value={ALL_CATEGORIES}>All categories</option>
            {categoryOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {(yearFilterActive || monthFilterActive || categoryFilterActive) && (
        <p className="mb-6 text-foreground-muted">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
        </p>
      )}
      <VideoList
        videos={filteredVideos}
        showBountyAfter={bountyAfter}
        spoilerCutoffMs={spoilerCutoffMs}
      />
    </>
  );
}
