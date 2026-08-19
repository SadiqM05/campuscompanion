import type { FC } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { TimerDisplay } from "../../components/ui/TimerDisplay";
import { CycleIndicator } from "../../components/ui/CycleIndicator";
import { cn } from "../../lib/cn";
import { usePomodoroTimer, type PomodoroPhase } from "./usePomodoroTimer";

const SESSIONS_PER_CYCLE = 4;

const phaseLabels: Record<PomodoroPhase, string> = {
  WORK: "Focus",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
};

const PomodoroPage: FC = () => {
  const {
    phase,
    secondsRemaining,
    totalSeconds,
    isRunning,
    completedWorkSessions,
    autoStart,
    justCompleted,
    start,
    pause,
    reset,
    toggleAutoStart,
  } = usePomodoroTimer();

  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="self-start text-2xl font-bold text-foreground">Pomodoro Timer</h1>

      <Card
        className={cn(
          "flex w-full max-w-sm flex-col items-center gap-6 py-10 transition-shadow duration-300",
          justCompleted && "ring-2 ring-accent"
        )}
      >
        <Badge>{phaseLabels[phase]}</Badge>

        <TimerDisplay secondsRemaining={secondsRemaining} totalSeconds={totalSeconds} />

        <CycleIndicator
          total={SESSIONS_PER_CYCLE}
          completed={completedWorkSessions % SESSIONS_PER_CYCLE}
        />

        <div className="flex items-center gap-3">
          <Button onClick={isRunning ? pause : start} className="w-32">
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="secondary" onClick={reset}>
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>

        <button
          type="button"
          onClick={toggleAutoStart}
          className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          Auto-start next phase:{" "}
          <span className={autoStart ? "text-accent" : undefined}>{autoStart ? "On" : "Off"}</span>
        </button>
      </Card>
    </div>
  );
};

export default PomodoroPage;
