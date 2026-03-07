type Props = {
  currentStep: number;
  currentYear: number;
  totalSteps: number;
  availableYears: number[];
  playing: boolean;
  speed: number;
  videoMode: boolean;
  onTogglePlaying: () => void;
  onStepChange: (step: number) => void;
  onYearChange: (year: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleVideoMode: () => void;
};

export function TimelineControls({
  currentStep,
  currentYear,
  totalSteps,
  availableYears,
  playing,
  speed,
  videoMode,
  onTogglePlaying,
  onStepChange,
  onYearChange,
  onPrevious,
  onNext,
  onSpeedChange,
  onToggleVideoMode,
}: Props) {
  return (
    <div className="panel controls-panel">
      <div className="controls-row">
        <div className="controls-main">
          <button className="control-button control-button--ghost" onClick={onPrevious} type="button">
            Anterior
          </button>
          <button className="control-button control-button--primary" onClick={onTogglePlaying} type="button">
            {playing ? "Pausar" : "Play"}
          </button>
          <button className="control-button control-button--ghost" onClick={onNext} type="button">
            Próximo
          </button>
        </div>

        <div className="controls-secondary">
          <label className="speed-input" aria-label="temporada da visualização">
            <span>Temporada</span>
            <div className="speed-input__field">
              <select
                className="speed-input__select"
                onChange={(event) => onYearChange(Number(event.target.value))}
                value={currentYear}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <button
            className={`speed-pill ${videoMode ? "is-active" : ""}`}
            onClick={onToggleVideoMode}
            type="button"
          >
            {videoMode ? "Modo página" : "Modo vídeo"}
          </button>

          <label className="speed-input" aria-label="velocidade da animação">
            <span>Velocidade</span>
            <div className="speed-input__field">
              <input
                inputMode="decimal"
                max={10}
                min={0.1}
                onChange={(event) => onSpeedChange(Number(event.target.value))}
                step={0.05}
                type="number"
                value={speed}
              />
              <small>x</small>
            </div>
          </label>
        </div>
      </div>

      <label className="timeline-slider">
        <span>
          Linha do tempo <strong>{currentStep}</strong> / {totalSteps}
        </span>
        <input
          max={totalSteps}
          min={0}
          onChange={(event) => onStepChange(Number(event.target.value))}
          type="range"
          value={currentStep}
        />
      </label>
    </div>
  );
}
