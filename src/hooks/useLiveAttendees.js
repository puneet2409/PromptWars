import { useState, useEffect, useRef } from 'react';

// ─── Stadium Geometry (mirrors MapPage SVG coordinates) ─────────────────────
const CONCOURSE_RX = 210, CONCOURSE_RY = 140;   // main walking ring
const SEAT_RX      = 162, SEAT_RY      = 108;   // seating band (inner ring)
const CX = 300, CY = 210;                        // map center

const ZONE_LIST = [
  { cx: 280, cy:  30 },   // Gate A
  { cx: 550, cy: 150 },   // Gate B
  { cx: 320, cy: 390 },   // Gate C
  { cx:  50, cy: 270 },   // Gate D
  { cx: 180, cy:  90 },   // Concession 1
  { cx: 420, cy:  90 },   // Concession 2
  { cx: 160, cy: 300 },   // Restroom N
  { cx: 440, cy: 300 },   // Restroom S
];

const ATTENDEE_COLORS = [
  '#f472b6','#fb923c','#a78bfa','#34d399',
  '#fbbf24','#60a5fa','#f87171','#2dd4bf',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const phiFromZone  = (z) => Math.atan2((z.cy - CY) / CONCOURSE_RY, (z.cx - CX) / CONCOURSE_RX);
const ellipsePoint = (phi, rx, ry) => ({ x: CX + rx * Math.cos(phi), y: CY + ry * Math.sin(phi) });
const lerp         = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));

function shortestDelta(from, to) {
  let d = to - from;
  while (d >  Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

// ─── State machine labels ─────────────────────────────────────────────────────
const S = {
  SEATED:       'seated',
  TO_CONCOURSE: 'to_concourse',
  ON_CONCOURSE: 'on_concourse',
  AT_ZONE:      'at_zone',
  RETURNING:    'returning',
};

function createAttendee(i, total) {
  const seatPhi = (i / total) * 2 * Math.PI;
  return {
    id: i,
    seatPhi,
    concoursePhi: seatPhi,
    color: ATTENDEE_COLORS[i % ATTENDEE_COLORS.length],
    state: S.SEATED,
    progress: 0,
    destZone: null,
    destPhi:  null,
    dwellStart:    Date.now() + Math.random() * 12000, // stagger initial departures
    dwellDuration: 0,
    walkSpeed: 0.0004 + Math.random() * 0.0004,  // ~3-5 min to cross the concourse
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
const COUNT = 24;

export function useLiveAttendees() {
  const attendeesRef = useRef(Array.from({ length: COUNT }, (_, i) => createAttendee(i, COUNT)));
  const [positions, setPositions] = useState([]);
  const rafRef = useRef(null);

  useEffect(() => {
    function tick() {
      const now = Date.now();

      attendeesRef.current = attendeesRef.current.map(a => {
        switch (a.state) {

          case S.SEATED: {
            if (now < a.dwellStart) return a;
            // Choose a random zone to visit
            const dest = ZONE_LIST[Math.floor(Math.random() * ZONE_LIST.length)];
            return { ...a, state: S.TO_CONCOURSE, progress: 0, destZone: dest, destPhi: phiFromZone(dest) };
          }

          case S.TO_CONCOURSE: {
            const progress = Math.min(1, a.progress + 0.004); // slow radial walk to concourse
            if (progress >= 1) return { ...a, state: S.ON_CONCOURSE, progress: 0, concoursePhi: a.seatPhi };
            return { ...a, progress };
          }

          case S.ON_CONCOURSE: {
            const delta = shortestDelta(a.concoursePhi, a.destPhi);
            const step  = Math.min(Math.abs(delta), a.walkSpeed);
            const newPhi = a.concoursePhi + Math.sign(delta) * step;
            if (Math.abs(shortestDelta(newPhi, a.destPhi)) < 0.015) {
              return {
                ...a,
                concoursePhi: a.destPhi,
                state: S.AT_ZONE,
                dwellStart: now,
                dwellDuration: 5000 + Math.random() * 10000,
              };
            }
            return { ...a, concoursePhi: newPhi };
          }

          case S.AT_ZONE: {
            if (now - a.dwellStart >= a.dwellDuration)
              return { ...a, state: S.RETURNING };
            return a;
          }

          case S.RETURNING: {
            const delta = shortestDelta(a.concoursePhi, a.seatPhi);
            const step  = Math.min(Math.abs(delta), a.walkSpeed);
            const newPhi = a.concoursePhi + Math.sign(delta) * step;

            if (Math.abs(shortestDelta(newPhi, a.seatPhi)) < 0.015) {
              return {
                ...a,
                concoursePhi: a.seatPhi,
                state: S.SEATED,
                dwellStart: now + 10000 + Math.random() * 20000,
                progress: 0,
                destZone: null,
              };
            }
            return { ...a, concoursePhi: newPhi };
          }

          default: return a;
        }
      });

      // ── Derive visual positions from logical state ────────────────────────
      const visual = attendeesRef.current.map(a => {
        const seatPt      = ellipsePoint(a.seatPhi,      SEAT_RX,       SEAT_RY);
        const concourseAt = ellipsePoint(a.concoursePhi, CONCOURSE_RX, CONCOURSE_RY);

        let x, y, isMoving = false;

        switch (a.state) {
          case S.SEATED:
            x = seatPt.x; y = seatPt.y;
            break;
          case S.TO_CONCOURSE:
            x = lerp(seatPt.x, concourseAt.x, a.progress);
            y = lerp(seatPt.y, concourseAt.y, a.progress);
            isMoving = true;
            break;
          case S.ON_CONCOURSE:
            x = concourseAt.x; y = concourseAt.y;
            isMoving = true;
            break;
          case S.AT_ZONE:
            x = a.destZone.cx; y = a.destZone.cy;
            break;
          case S.RETURNING:
            // walk back along concourse until close enough then lerp inward
            if (Math.abs(shortestDelta(a.concoursePhi, a.seatPhi)) < 0.3) {
              const t = 1 - Math.abs(shortestDelta(a.concoursePhi, a.seatPhi)) / 0.3;
              x = lerp(concourseAt.x, seatPt.x, t);
              y = lerp(concourseAt.y, seatPt.y, t);
            } else {
              x = concourseAt.x; y = concourseAt.y;
            }
            isMoving = true;
            break;
          default:
            x = seatPt.x; y = seatPt.y;
        }

        return { id: a.id, x, y, color: a.color, isMoving, state: a.state };
      });

      setPositions(visual);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return positions;
}
