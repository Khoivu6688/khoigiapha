import { Lunar, Solar } from "lunar-javascript";

export type EventType = "birthday" | "death_anniversary" | "custom_event";

export interface FamilyEvent {
  personId: string | null;
  personName: string;
  type: EventType;
  nextOccurrence: Date;
  daysUntil: number;
  eventDateLabel: string;
  originYear?: number | null;
  originMonth?: number | null;
  originDay?: number | null;
  isDeceased: boolean;
  location?: string | null;
  content?: string | null;
}

export interface CustomEventRecord {
  id: string;
  name: string;
  content: string | null;
  event_date: string;
  location: string | null;
  created_by: string | null;
}

/**
 * Tìm ngày dương tiếp theo từ ngày âm
 */
function nextSolarForLunar(
  lunarMonth: number,
  lunarDay: number,
  fromDate: Date,
): Date | null {
  const todaySolar = Solar.fromYmd(
    fromDate.getFullYear(),
    fromDate.getMonth() + 1,
    fromDate.getDate(),
  );

  const currentLunarYear = todaySolar.getLunar().getYear();

  const LunarClass = Lunar as any;

  for (let offset = 0; offset <= 2; offset++) {
    try {
      const l = LunarClass.fromYmd(
        currentLunarYear + offset,
        lunarMonth,
        lunarDay,
      );

      const s = l.getSolar();

      const candidate = new Date(
        s.getYear(),
        s.getMonth() - 1,
        s.getDay(),
      );

      if (candidate >= fromDate) return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

export function computeEvents(
  persons: {
    id: string;
    full_name: string;
    birth_year: number | null;
    birth_month: number | null;
    birth_day: number | null;
    death_year: number | null;
    death_month: number | null;
    death_day: number | null;
    is_deceased: boolean;
  }[],
  customEvents: CustomEventRecord[] = []
): FamilyEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events: FamilyEvent[] = [];

  for (const p of persons) {

    // ───────────── 🎂 SINH NHẬT (DƯƠNG) ─────────────
    if (p.birth_month && p.birth_day) {
      const thisYear = today.getFullYear();

      let next = new Date(thisYear, p.birth_month - 1, p.birth_day);

      if (next < today) {
        next = new Date(thisYear + 1, p.birth_month - 1, p.birth_day);
      }

      const daysUntil = Math.round(
        (next.getTime() - today.getTime()) / 86400000
      );

      events.push({
        personId: p.id,
        personName: p.full_name,
        type: "birthday",
        nextOccurrence: next,
        daysUntil,
        eventDateLabel: `${p.birth_day
          .toString()
          .padStart(2, "0")}/${p.birth_month
          .toString()
          .padStart(2, "0")}`,
        originYear: p.birth_year,
        originMonth: p.birth_month,
        originDay: p.birth_day,
        isDeceased: p.is_deceased,
      });
    }

    // ───────────── ⚰️ NGÀY GIỖ (ÂM - FIX CHUẨN) ─────────────
    if (p.is_deceased && p.death_month && p.death_day) {
      try {
        // ❗ DÙNG TRỰC TIẾP NGÀY ÂM (KHÔNG CONVERT NỮA)
        const lMonth = p.death_month;
        const lDay = p.death_day;

        const next = nextSolarForLunar(lMonth, lDay, today);
        if (!next) continue;

        const daysUntil = Math.round(
          (next.getTime() - today.getTime()) / 86400000
        );

        events.push({
          personId: p.id,
          personName: p.full_name,
          type: "death_anniversary",
          nextOccurrence: next,
          daysUntil,
          eventDateLabel: `${lDay
            .toString()
            .padStart(2, "0")}/${lMonth
            .toString()
            .padStart(2, "0")} ÂL`,
          originYear: p.death_year,
          originMonth: lMonth,
          originDay: lDay,
          isDeceased: true,
        });
      } catch {
        continue;
      }
    }
  }

  // ───────────── ⭐ CUSTOM EVENT ─────────────
  for (const ce of customEvents) {
    if (!ce.event_date) continue;

    const [y, m, d] = ce.event_date.split("-").map(Number);
    if (!y || !m || !d) continue;

    const next = new Date(y, m - 1, d);

    const daysUntil = Math.round(
      (next.getTime() - today.getTime()) / 86400000
    );

    events.push({
      personId: ce.id,
      personName: ce.name,
      type: "custom_event",
      nextOccurrence: next,
      daysUntil,
      eventDateLabel: `${d
        .toString()
        .padStart(2, "0")}/${m
        .toString()
        .padStart(2, "0")}/${y}`,
      originYear: y,
      isDeceased: false,
      location: ce.location,
      content: ce.content,
    });
  }

  // Sort gần nhất trước
  events.sort((a, b) => a.daysUntil - b.daysUntil);

  return events;
}
