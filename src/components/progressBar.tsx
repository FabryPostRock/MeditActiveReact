import type { CSSProperties } from 'react';
import type { TrainingStatus } from '../store/trainingProgressSlice';
/**
 *  The goal is to create and pass a custom property from React to CSS.
 *  Typing made to not use a generic custom properties but explicitating the custom property.
 * */
type ProgressStyle = CSSProperties & {
  '--progress-value': string;
};

const MILESTONES = [
  // percent value is used for label positioning
  { label: 'Video', percent: 0 },
  { label: 'Pratica', percent: 33 },
  { label: 'Verifica', percent: 66 },
  { label: 'Completato', percent: 100 },
];

interface UserProgress {
  status: TrainingStatus;
  trainingCompleted: boolean;
  videoCompleted: boolean;
}

export function ProgressBar({ status, trainingCompleted, videoCompleted }: UserProgress) {
  let progress = 0;
  // 'progress' value changes with props change, therefore useState is not necessary

  if (!trainingCompleted) {
    if (videoCompleted && status == 'idle') {
      progress = 33;
    } else if (videoCompleted && status == 'readyToComplete') {
      progress = 66;
    }
  }
  if (trainingCompleted) {
    progress = 100;
  }

  const progressStyle: ProgressStyle = {
    '--progress-value': `${progress}%`,
  };

  return (
    <div className="col-10">
      <div className="lesson-progress">
        <div className="progress-track">
          <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar" style={progressStyle} />
          </div>

          <div className="milestones">
            {MILESTONES.map((milestone) => (
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
      </div>
    </div>
  );
}
