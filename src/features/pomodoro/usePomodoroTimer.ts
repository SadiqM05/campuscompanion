import { useCallback, useEffect, useReducer, useRef } from "react";

export type PomodoroPhase = "WORK" | "SHORT_BREAK" | "LONG_BREAK";

const WORK_SECONDS = 25 * 60;
const SHORT_BREAK_SECONDS = 5 * 60;
const LONG_BREAK_SECONDS = 15 * 60;
const SESSIONS_PER_CYCLE = 4;

const phaseDuration = (phase: PomodoroPhase): number => {
  switch (phase) {
    case "WORK":
      return WORK_SECONDS;
    case "SHORT_BREAK":
      return SHORT_BREAK_SECONDS;
    case "LONG_BREAK":
      return LONG_BREAK_SECONDS;
  }
};

interface State {
  phase: PomodoroPhase;
  secondsRemaining: number;
  isRunning: boolean;
  completedWorkSessions: number;
  autoStart: boolean;
  justCompleted: boolean;
}

type Action =
  | { type: "TICK" }
  | { type: "PHASE_COMPLETE" }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "TOGGLE_AUTO_START" }
  | { type: "CLEAR_JUST_COMPLETED" };

const initialState: State = {
  phase: "WORK",
  secondsRemaining: WORK_SECONDS,
  isRunning: false,
  completedWorkSessions: 0,
  autoStart: false,
  justCompleted: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "TICK":
      return { ...state, secondsRemaining: state.secondsRemaining - 1 };
    case "PHASE_COMPLETE": {
      if (state.phase === "WORK") {
        const nextCompleted = state.completedWorkSessions + 1;
        const nextPhase: PomodoroPhase =
          nextCompleted % SESSIONS_PER_CYCLE === 0 ? "LONG_BREAK" : "SHORT_BREAK";
        return {
          ...state,
          phase: nextPhase,
          secondsRemaining: phaseDuration(nextPhase),
          completedWorkSessions: nextCompleted,
          isRunning: state.autoStart,
          justCompleted: true,
        };
      }
      return {
        ...state,
        phase: "WORK",
        secondsRemaining: phaseDuration("WORK"),
        isRunning: state.autoStart,
        justCompleted: true,
      };
    }
    case "START":
      return { ...state, isRunning: true };
    case "PAUSE":
      return { ...state, isRunning: false };
    case "RESET":
      return { ...initialState, autoStart: state.autoStart };
    case "TOGGLE_AUTO_START":
      return { ...state, autoStart: !state.autoStart };
    case "CLEAR_JUST_COMPLETED":
      return { ...state, justCompleted: false };
  }
};

// Short, non-intrusive two-tone chime - synthesized so no audio asset is
// needed. The AudioContext is created lazily on the user's first Start press
// (see `start` below) since browsers block audio until a real user gesture.
const playChime = (context: AudioContext | null): void => {
  if (!context) return;
  const now = context.currentTime;
  [660, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(context.destination);
    const start = now + index * 0.18;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
    oscillator.start(start);
    oscillator.stop(start + 0.18);
  });
};

interface UsePomodoroTimerResult {
  phase: PomodoroPhase;
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  completedWorkSessions: number;
  autoStart: boolean;
  justCompleted: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  toggleAutoStart: () => void;
}

export const usePomodoroTimer = (): UsePomodoroTimerResult => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Countdown - ticks once per second while running.
  useEffect(() => {
    if (!state.isRunning) return;
    const intervalId = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => window.clearInterval(intervalId);
  }, [state.isRunning]);

  // Phase transition - fires once secondsRemaining hits 0; the reducer
  // decides the next phase (short break / long break / back to work) and
  // whether to keep running, based on the auto-start preference.
  useEffect(() => {
    if (state.secondsRemaining > 0) return;
    playChime(audioContextRef.current);
    dispatch({ type: "PHASE_COMPLETE" });
  }, [state.secondsRemaining]);

  // Clears the transient "just completed" flash used for the card pulse.
  useEffect(() => {
    if (!state.justCompleted) return;
    const timeoutId = window.setTimeout(() => dispatch({ type: "CLEAR_JUST_COMPLETED" }), 600);
    return () => window.clearTimeout(timeoutId);
  }, [state.justCompleted]);

  const start = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    dispatch({ type: "START" });
  }, []);

  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const toggleAutoStart = useCallback(() => dispatch({ type: "TOGGLE_AUTO_START" }), []);

  return {
    phase: state.phase,
    secondsRemaining: state.secondsRemaining,
    totalSeconds: phaseDuration(state.phase),
    isRunning: state.isRunning,
    completedWorkSessions: state.completedWorkSessions,
    autoStart: state.autoStart,
    justCompleted: state.justCompleted,
    start,
    pause,
    reset,
    toggleAutoStart,
  };
};
