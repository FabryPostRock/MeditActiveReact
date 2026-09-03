import Title from './title';
import { Link } from 'react-router-dom';
import type ExerciseSection from '../../data/learningContent';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import useTrainingTimer from '../../store/timerHooks';
import {
  setVideoProgress,
  setVideoCompleted,
  startTraining,
  pauseTraining,
  setReadyToBeCompleted,
  completeTraining,
} from '../../store/trainingProgressSlice';

import { useRef, type SyntheticEvent } from 'react';

/**
 * Definizione props con le caratteristiche statiche passate dal padre
 */
interface ExerciseCardProps {
  section: ExerciseSection;
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.ceil(durationMs / 1000);
  //
  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;
  /**
   * Returned object:
   * - [minutes, seconds].map((value) =>: 'value' returns the single array element for each cycle -> [2, 3]
   * - String(value).padStart(2, '0') : 'value' converted to string and than leading '0' added -> ['02', '03']
   */
  return [minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function getPlayedSeconds(video: HTMLVideoElement) {
  let playedSeconds = 0;

  for (let index = 0; index < video.played.length; index += 1) {
    playedSeconds += video.played.end(index) - video.played.start(index);
  }

  return playedSeconds;
}

export default function ExerciseView({ section }: ExerciseCardProps) {
  const dispatch = useAppDispatch();
  const VIDEO_PROGRESS_INTERVAL_SECONDS = 2;
  /**
   * useRef saves the last recorded interval
   * -1 → no interval yet registered
      0 → interval 0–1 seconds
      1 → interval 2–3 seconds
      2 → interval 4–5 seconds
      3 → interval 6–7 seconds
   */
  const lastRecordedInterval = useRef(-1);

  const handleVideoTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const currentSecond = Math.floor(video.currentTime);
    const currentInterval = Math.floor(currentSecond / VIDEO_PROGRESS_INTERVAL_SECONDS);
    if (currentInterval === lastRecordedInterval.current) {
      return;
    }

    lastRecordedInterval.current = currentInterval;

    dispatch(
      setVideoProgress({
        sectionId: section.id,
        currentSecond,
        watchedSeconds: Math.floor(getPlayedSeconds(video)),
        durationSeconds: video.duration,
      }),
    );
  };

  const handleVideoEnded = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    dispatch(
      setVideoCompleted({
        sectionId: section.id,
        watchedSeconds: Math.floor(getPlayedSeconds(video)),
        durationSeconds: video.duration,
      }),
    );
  };

  const { progress, currentSessionMs } = useTrainingTimer(section);

  const status = progress?.status ?? 'idle';
  const videoCompleted = progress?.videoCompleted ?? false;

  return (
    <article>
      <div>
        <Title title={section.title} />
        <div>
          {/**<iframe> doesn't not allow any video control. With <video> you can but
           * you must use a real video format not an html page that wraps a video.
           */}
          <video
            src={section.videoUrl}
            controls
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
            aria-label={`Video: ${section.title}`}
          />
          <p>{section.description}</p>
        </div>
        <div>
          <p>Stato: {status}</p>

          <p>
            Video:
            {videoCompleted ? ' completato' : ' da vedere'}
          </p>
        </div>
        <div>
          <p>{formatDuration(progress.status === 'running' ? currentSessionMs : progress.elapsedTrainingMs)}</p>
          <div className="d-flex col-3 justify-content-center m-3 m-lg-5">
            <button
              className="btn-big btn btn-secondary btn-icons-secondary d-inline-flex align-items-center justify-content-center w-100 rounded-5"
              onClick={
                progress.status === 'running'
                  ? () =>
                      dispatch(
                        pauseTraining({
                          sectionId: section.id,
                          elapsedTrainingMs: Date.now(),
                        }),
                      )
                  : () => dispatch(startTraining({ sectionId: section.id, startedAtMs: Date.now() }))
              }
            >
              {' '}
              <span className="material-symbols-outlined g-icon-sm-2em g-icon-color">
                {progress.status === 'running' ? 'pause' : 'play_arrow'}
              </span>{' '}
            </button>
          </div>

          <div className="d-flex col-3 justify-content-center m-3 m-lg-5">
            <button className="btn-big btn btn-secondary btn-icons-secondary d-inline-flex align-items-center justify-content-center w-100 rounded-5 ">
              {' '}
              <span className="material-symbols-outlined g-icon-sm-2em g-icon-color">history</span>{' '}
            </button>
          </div>
          <button> Completa Allenamento </button>
        </div>
      </div>
    </article>
  );
}
