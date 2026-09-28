import type { CSSProperties } from 'react';
import type { TrainingStatus } from '../store/trainingProgressSlice';
/**
 *  The goal is to create and pass a custom property from React to CSS.
 *  Typing made to not use a generic custom properties but explicitating the custom property.
 * */
type ProgressStyle = CSSProperties & {
  '--progress-value': string;
};

type MilestoneLabel = 'Inizio' | 'Video' | 'Pratica' | 'Verifica' | 'Completato';

type Milestone = {
  label: MilestoneLabel;
  percent: number;
};

const MILESTONES = [
  // percent value is used for label positioning
  { label: 'Inizio', percent: 0 },
  { label: 'Video', percent: 33 },
  { label: 'Pratica', percent: 66 },
  { label: 'Completato', percent: 100 },
] as const satisfies readonly Milestone[];

interface UserProgress {
  status: TrainingStatus;
  trainingCompleted: boolean;
  videoCompleted: boolean;
}

function getMilestonePercent(label: MilestoneLabel) {
  let percent = 0;
  const videoMilestone = MILESTONES.find((item) => item.label === label);

  if (!videoMilestone) {
    throw new Error('Video milestone not found.');
  }

  return (percent = videoMilestone.percent);
}

export function ProgressBar({ status, trainingCompleted, videoCompleted }: UserProgress) {
  let progress = 0;
  // 'progress' value changes with props change, therefore useState is not necessary

  if (!trainingCompleted) {
    if (videoCompleted && status == 'idle') {
      progress = getMilestonePercent('Video');
    } else if (videoCompleted && status == 'readyToComplete') {
      progress = getMilestonePercent('Pratica');
    }
  }
  if (trainingCompleted) {
    progress = getMilestonePercent('Completato');
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
