import { Title } from '../title';
import { Link } from 'react-router-dom';
import type ExerciseSection from '../../data/learningContent';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import useTrainingTimer from '../../store/timerHooks';
import Error from '../../pages/error';
import {
  setVideoProgress,
  startVideoPlayback,
  stopVideoPlayback,
  setVideoCompleted,
  startTraining,
  pauseTraining,
  completeTraining,
  resetTraining,
} from '../../store/trainingProgressSlice';

import { useRef, useEffect, type SyntheticEvent } from 'react';
import { store } from '../../store/store';
import { ProgressBar } from '../progressBar';

/**
 * Definizione props con le caratteristiche statiche passate dal padre
 */
interface ExerciseCardProps {
  section: ExerciseSection;
  isLocked: boolean;
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

/**
 * This function return the playedSeconds and doesn't update them if the user slide backward or forward
 * @param video: the HTML video element
 * @returns playedSeconds
 */
function getPlayedSeconds(video: HTMLVideoElement) {
  let playedSeconds = 0;

  for (let index = 0; index < video.played.length; index += 1) {
    playedSeconds += video.played.end(index) - video.played.start(index);
  }

  return playedSeconds;
}

export default function ExerciseView({ section, isLocked }: ExerciseCardProps) {
  const dispatch = useAppDispatch();
  // Using useAppSelector is quite more secure then store.getState because in the former
  // case the state is subscribed to changes.
  const state = useAppSelector((state) => state);

  useEffect(() => {
    const releaseActiveSection = () => {
      const currentActiveSectionId = store.getState().trainingProgress.activeSectionId;
      // This control avoids state resetting through inactive page.
      if (currentActiveSectionId !== section.id) return;

      dispatch(stopVideoPlayback({ sectionId: section.id }));
    };

    // cross compatible through different browsers
    window.addEventListener('beforeunload', releaseActiveSection);

    return () => {
      window.removeEventListener('beforeunload', releaseActiveSection);
    };
  }, [dispatch, section.id]);

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
    console.log(
      `handleVideoTimeUpdate  - playedSeconds: ${Math.floor(getPlayedSeconds(video))} currentSecond: ${currentSecond}  currentInterval: ${currentInterval}`,
    );
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

  const handleVideoPlay = (event: SyntheticEvent<HTMLVideoElement>) => {
    console.log(
      `handleVideoPlay activeSectionId : ${state.trainingProgress.activeSectionId}  section.id: ${section.id}`,
    );
    dispatch(
      startVideoPlayback({
        sectionId: section.id,
      }),
    );
    // The activeSectionId coming from the component hook useAppSelector, cannot update the variable as soon as
    // a rerender is done. Therefore activeSectionId can be a previous one.
    const currentActiveSectionId = store.getState().trainingProgress.activeSectionId;

    if (currentActiveSectionId !== section.id) {
      event.currentTarget.pause();
    }
  };

  const handleVideoPause = () => {
    dispatch(
      stopVideoPlayback({
        sectionId: section.id,
      }),
    );
  };

  const { progress, currentSessionMs, totalElapsedMs } = useTrainingTimer(section);

  const status = progress?.status ?? 'idle';
  const videoCompleted = progress?.videoCompleted ?? false;
  const trainingCompleted = progress?.trainingCompleted ?? false;
  console.log(`ExerciseView - currentSessionMs: ${currentSessionMs}   totalElapsedMs: ${totalElapsedMs}`);
  return !isLocked ? (
    <article>
      <div className="row">
        <div className="col-12 d-flex justify-content-center">
          <Title
            title={section.title}
            txtColor={'var(--bs-secondary)'}
            txtSize={['fs-2']}
            headlineType={'h2'}
            position={'text-center'}
            underlineOnHover={true}
            scaleOnHover={false}
          />
        </div>
        <div className="col-12 mt-3">
          <div className="row d-flex justify-content-center">
            <div className="col-12 d-flex justify-content-center">
              {/**<iframe> doesn't not allow any video control. With <video> you can but
               * you must use a real video format not an html page that wraps a video.
               */}
              <video
                className="h-auto w-sm-80 w-md-40 rounded"
                src={section.videoUrl}
                controls
                //timeupdate, ended, play, pause are standards DOM events for <video> tag but in react turn into CamelCase properties
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                aria-label={`Video: ${section.title}`}
              />
            </div>
            <div className="col-12 d-flex justify-content-center text-justify mt-3">
              <p>{section.description}</p>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="row d-flex justify-content-center">
            <ProgressBar status={status} trainingCompleted={trainingCompleted} videoCompleted={videoCompleted} />
          </div>
        </div>
        <div className="col d-flex justify-content-center">
          <div className="row w-100 d-flex justify-content-center">
            <div className="col-12 d-flex justify-content-center text-justify mt-5">
              <p>{formatDuration(totalElapsedMs)}</p>
            </div>
            <div className="col-12 col-sm-4 d-flex  justify-content-center m-3 mx-md-0">
              <div className="row w-100 d-flex justify-content-center">
                <div className="col-6 col-sm-12 col-lg-9">
                  <button
                    className={`btn-min-h btn btn-secondary btn-icons-secondary h-100 w-100 d-flex align-items-center justify-content-center rounded-5 ${videoCompleted && status !== 'readyToComplete' ? '' : 'disabled'}`}
                    aria-disabled={videoCompleted && status !== 'readyToComplete' ? undefined : true}
                    onClick={
                      status === 'running'
                        ? () =>
                            dispatch(
                              pauseTraining({
                                sectionId: section.id,
                                elapsedTrainingMs: Date.now(),
                              }),
                            )
                        : () =>
                            dispatch(
                              !progress.startedAtMs
                                ? // The start time is absolute and is needed only at the first start
                                  startTraining({ sectionId: section.id, startedAtMs: Date.now() })
                                : startTraining({ sectionId: section.id }),
                            )
                    }
                  >
                    {' '}
                    <span className="material-symbols-outlined g-icon-2em g-icon-lg-3em g-icon-color">
                      {status === 'running' ? 'pause' : 'play_arrow'}
                    </span>{' '}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-4 d-flex justify-content-center m-3 mx-md-0">
              <div className="row w-100 d-flex justify-content-center">
                <div className="col-6 col-sm-12 col-lg-9">
                  <button
                    className={`btn-min-h btn btn-secondary btn-icons-secondary h-100 w-100 d-flex align-items-center justify-content-center rounded-5 ${status === 'completed' || status === 'readyToComplete' ? '' : 'disabled'}`}
                    aria-disabled={status === 'completed' || status === 'readyToComplete' ? undefined : true}
                    onClick={() =>
                      dispatch(
                        resetTraining({
                          sectionId: section.id,
                        }),
                      )
                    }
                  >
                    {' '}
                    <span className="material-symbols-outlined g-icon-2em g-icon-lg-3em g-icon-lg-3em g-icon-color">
                      history
                    </span>{' '}
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-4 d-flex justify-content-center m-3 mx-md-0">
              <div className="row w-100 d-flex justify-content-center">
                <div className="col-6 col-sm-12 col-lg-9">
                  <button
                    className={`btn-min-h btn btn-secondary btn-icons-secondary h-100 w-100 d-flex align-items-center justify-content-center rounded-5 ${status === 'readyToComplete' && !progress.trainingCompleted ? '' : 'disabled'}`}
                    aria-disabled={status === 'readyToComplete' && !progress.trainingCompleted ? undefined : true}
                    onClick={() =>
                      dispatch(
                        completeTraining({
                          sectionId: section.id,
                        }),
                      )
                    }
                  >
                    <span className="material-symbols-outlined g-icon-2em g-icon-lg-3em g-icon-color">check</span>
                    Esercizio Completato{' '}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  ) : (
    <Error />
  );
}
