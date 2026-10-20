import React, { useRef, useState } from "react";
import { Bookmark, Folder, House, Search, User } from "lucide-react";
import "./GlassDock.css";

export type GlassDockItem = {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;
  badge?: number;
};

const DEFAULT_DOCK: GlassDockItem[] = [
  { key: "home", label: "Home", Icon: House },
  { key: "search", label: "Search", Icon: Search },
  { key: "files", label: "Files", Icon: Folder },
  { key: "saved", label: "Saved", Icon: Bookmark },
  { key: "you", label: "You", Icon: User },
];

/* ══ dock, distance based magnification ═══════════════════
   Scale falls off with distance from the cursor rather than
   applying only to the hovered item, which is what stops it
   reading as a row of buttons that happen to grow. */

export interface GlassDockProps {
  items?: GlassDockItem[];
  active?: string;
  defaultActive?: string;
  onSelect?: (key: string) => void;
  /* what the glyph under the cursor grows to */
  magnify?: number;
  /* how many neighbours either side feel it */
  spread?: number;
  /* how far the nearest glyph rises out of the bar */
  lift?: number;
  /* the name that appears over whatever is under the cursor */
  labels?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function GlassDock({
  items = DEFAULT_DOCK,
  active: controlledActive,
  defaultActive,
  onSelect,
  /* what the glyph under the cursor grows to */
  magnify = 1.32,
  /* how many neighbours either side feel it. This is the knob
     that decides whether the dock reads as a row of buttons
     that happen to grow or as a sheet being pushed up from
     underneath — at 0 it is the former, and no amount of
     magnification rescues it. */
  spread = 2,
  /* how far the nearest glyph rises out of the bar */
  lift = 8,
  /* the name that appears over whatever is under the cursor */
  labels = true,
  className = "",
  style,
}: GlassDockProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [internalActive, setInternalActive] = useState(() => defaultActive ?? items[0]?.key ?? "home");
  const active = controlledActive !== undefined ? controlledActive : internalActive;

  /* ── THE BAR READS THE POINTER, THE ITEMS DO NOT ─────────
     Each item used to carry its own onMouseEnter, which fails
     on a touch screen twice over. A mouse event is the smaller
     half of it — the real problem is that a touch is captured
     to whatever it started on, so sliding a finger along the
     dock keeps sending every event to the first icon you
     landed on and nothing else ever learns the finger arrived.

     One handler on the bar, and the index comes from where the
     pointer is: the nearest item centre to the pointer's x.
     Measured rather than derived from the index, because the
     items are not all the same width once one of them is
     magnified — the geometry moves as you sweep, which is
     exactly what makes a dock a dock, and an arithmetic guess
     would lag it. */
  const bar = useRef<HTMLElement | null>(null);
  const down = useRef(false);
  /* set when a finger has already chosen on lift, so the click
     the browser sends afterwards — aimed at whichever item the
     touch STARTED on, which is not the one it ended over — does
     not undo the choice. A mouse never sets it. */
  const chose = useRef(false);

  const at = (clientX: number) => {
    const dockElements = bar.current?.querySelectorAll(".gdock-item");
    if (!dockElements?.length) return null;
    let best = 0;
    let gap = Infinity;
    dockElements.forEach((el, i) => {
      const b = el.getBoundingClientRect();
      const d = Math.abs(clientX - (b.left + b.width / 2));
      if (d < gap) { gap = d; best = i; }
    });
    return best;
  };

  /* Crossing onto a glyph, not hovering one */
  const to = (i: number | null) => {
    setHover(i);
  };

  const track = (e: React.PointerEvent) => {
    /* a mouse magnifies on hover, the way it always did; a
       finger has to be down, or the bar would answer a scroll
       passing over it */
    if (e.pointerType !== "mouse" && !down.current) return;
    to(at(e.clientX));
  };

  return (
    <nav
      className={`gdock ${className}`}
      aria-label="Dock de navegación"
      ref={bar}
      style={style}
      /* ── CAPTURE PHASE, and no pointer capture ─────────── */
      onPointerDownCapture={(e) => {
        down.current = true;
        chose.current = false;
        to(at(e.clientX));
      }}
      onPointerMoveCapture={track}
      /* ── and the touch has to CHOOSE something ──────────── */
      onPointerUpCapture={(e) => {
        if (down.current && e.pointerType !== "mouse") {
          const i = at(e.clientX);
          if (i !== null && items[i]) {
            chose.current = true;
            const chosenKey = items[i].key;
            if (chosenKey !== active) {
              if (controlledActive === undefined) setInternalActive(chosenKey);
              onSelect?.(chosenKey);
            }
          }
        }
        down.current = false;
        if (e.pointerType !== "mouse") to(null);
      }}
      onPointerCancelCapture={() => { down.current = false; to(null); }}
      onPointerLeave={() => { if (!down.current) to(null); }}
    >
      {items.map(({ key, label, Icon, badge }, i) => {
        const d = hover === null ? 99 : Math.abs(i - hover);
        /* A raised cosine over the reach, rather than the three
           hand-picked steps this used to carry. */
        const f =
          d > spread ? 0 : (1 + Math.cos((Math.PI * d) / (spread + 1))) / 2;
        const scale = 1 + (magnify - 1) * f;
        const isCurrent = active === key;

        return (
          <button
            key={key}
            type="button"
            className="gdock-item"
            aria-label={label}
            aria-current={isCurrent ? "page" : undefined}
            data-near={d <= 1 ? d : undefined}
            data-active={isCurrent}
            onClick={() => {
              /* the lift already chose — see `chose` */
              if (chose.current) return;
              if (controlledActive === undefined) setInternalActive(key);
              onSelect?.(key);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* the glyph magnifies, not the button */}
            <span
              className="gdock-glyph"
              style={{ transform: `translateY(${-lift * f}px) scale(${scale})` }}
            >
              <Icon size={20} strokeWidth={2} />
              {badge !== undefined && badge > 0 && (
                <span className="gdock-badge" aria-hidden="true">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </span>
            <span className="gdock-dot" data-on={isCurrent} />
            {labels && (
              <span className="gdock-tip" data-on={hover === i}>
                {label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
