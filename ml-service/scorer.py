# ================================================================
#  scorer.py — Suspicion scoring with debouncing and tab switches
# ================================================================

import time

POINTS_PHONE          = 50   # instant
POINTS_MULTIPLE_FACES = 40   # instant
POINTS_NO_FACE        = 30   # instant
POINTS_LOOKING_AWAY   = 20   # after LOOK_AWAY_HOLD_SECONDS continuous
POINTS_TAB_SWITCH     = 25   # per tab switch (cumulative, capped)
MAX_SCORE             = 100
LOOK_AWAY_HOLD_SECS   = 2.5  # reduced from 3s for faster response


class SuspicionScorer:

    def __init__(self):
        self.look_away_start  = None
        self.look_away_secs   = 0.0
        self.tab_switch_score = 0

    def add_tab_switch(self):
        """Call once each time the student switches tabs."""
        self.tab_switch_score = min(self.tab_switch_score + POINTS_TAB_SWITCH, 50)

    def update(self, face_count, direction, phone_detected=False):
        now    = time.time()
        score  = self.tab_switch_score   # carry over tab penalty
        events = []

        # ── Phone visible ─────────────────────────────────────────
        if phone_detected:
            score += POINTS_PHONE
            events.append("phone_detected")

        # ── No face ───────────────────────────────────────────────
        if face_count == 0 or direction == "no_face":
            score += POINTS_NO_FACE
            events.append("no_face")
            self.look_away_start = None
            self.look_away_secs  = 0.0

        # ── Multiple faces ────────────────────────────────────────
        elif face_count > 1:
            score += POINTS_MULTIPLE_FACES
            events.append("multiple_faces")
            self.look_away_start = None
            self.look_away_secs  = 0.0

        # ── Looking away ──────────────────────────────────────────
        elif direction in ("looking_left", "looking_right",
                           "looking_up", "looking_down"):
            if self.look_away_start is None:
                self.look_away_start = now
            self.look_away_secs = now - self.look_away_start

            if self.look_away_secs >= LOOK_AWAY_HOLD_SECS:
                score += POINTS_LOOKING_AWAY
                events.append("looking_away")

        # ── All clear ─────────────────────────────────────────────
        else:
            self.look_away_start = None
            self.look_away_secs  = 0.0

        return {
            "suspicion_score": min(score, MAX_SCORE),
            "events":          events,
            "look_away_secs":  round(self.look_away_secs, 1),
            "is_suspicious":   score > 0,
        }
