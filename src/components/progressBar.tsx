import type { CSSProperties } from 'react';

/**
 *  The goal is to create and pass a custom property from React to CSS.
 *  Typing made to not use a generic custom properties but explicitating the custom property.
 * */
type ProgressStyle = CSSProperties & {
  '--progress-value': string;
};

const milestones = [
  { label: 'Video', percent: 0 },
  { label: 'Pratica', percent: 33 },
  { label: 'Verifica', percent: 66 },
  { label: 'Completato', percent: 100 },
];

export function LessonProgress() {
  const progress = 45;
  const progressStyle: ProgressStyle = {
    '--progress-value': `${progress}%`,
  };
  // style={progressStyle}
  return (
    <div className="lesson-progress">
      <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="milestones">
        {milestones.map((milestone) => (
          <div
            key={milestone.label}
            className="milestone"
            style={{
              left: `${milestone.percent}%`,
            }}
          >
            <span className={`milestone-dot ${progress >= milestone.percent ? 'completed' : ''}`} />

            <span className="milestone-label">{milestone.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
