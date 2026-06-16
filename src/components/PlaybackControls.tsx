import "./PlaybackControls.css";

interface PlaybackControlsProps {
  stepIndex: number;
  stepCount: number;
  canStepBack: boolean;
  canStepForward: boolean;
  disabled?: boolean;
  onStepBack: () => void;
  onStepForward: () => void;
}

function ArrowUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4.5 10.5 8 7l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4.5 5.5 8 9l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlaybackControls({
  stepIndex,
  stepCount,
  canStepBack,
  canStepForward,
  disabled = false,
  onStepBack,
  onStepForward,
}: PlaybackControlsProps) {
  const showStepCount = stepCount > 1;

  return (
    <div
      className="playback-controls"
      role="group"
      aria-label="Animation step controls"
    >
      <button
        type="button"
        className="playback-controls__btn"
        onClick={onStepBack}
        disabled={disabled || !canStepBack}
        aria-label="Previous step"
        title="Previous step (↑)"
      >
        <ArrowUpIcon />
      </button>
      {showStepCount && (
        <span className="playback-controls__counter" aria-live="polite">
          {stepIndex + 1}
          <span className="playback-controls__counter-sep">/</span>
          {stepCount}
        </span>
      )}
      <button
        type="button"
        className="playback-controls__btn"
        onClick={onStepForward}
        disabled={disabled || !canStepForward}
        aria-label="Next step"
        title="Next step (↓)"
      >
        <ArrowDownIcon />
      </button>
    </div>
  );
}
