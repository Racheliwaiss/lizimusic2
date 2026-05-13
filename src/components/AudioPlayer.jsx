import React, { useState, useRef, useEffect } from 'react';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/designTokens';

/**
 * Audio Player Component
 * Features: play/pause, progress bar, volume control, current time, duration
 */
const AudioPlayer = ({
  src,
  title = 'Unknown Track',
  artist = 'Unknown Artist',
  onPlay,
  onPause,
  isDarkMode = false,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audio.play();
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentTime(audio.currentTime);
  };

  const handleVolumeChange = (e) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    if (audio) {
      audio.volume = newVolume;
    }
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const containerStyle = {
    backgroundColor: isDarkMode ? COLORS.deepIndigo : COLORS.softLavender,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontFamily: TYPOGRAPHY.fontFamily,
    border: `1px solid ${COLORS.electricPurple}`,
  };

  const headerStyle = {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottom: `1px solid ${COLORS.borderGray}`,
  };

  const titleStyle = {
    ...TYPOGRAPHY.heading2,
    margin: 0,
    marginBottom: SPACING.xs,
    color: isDarkMode ? COLORS.white : COLORS.black,
  };

  const artistStyle = {
    ...TYPOGRAPHY.body2,
    margin: 0,
    color: isDarkMode ? COLORS.lightGray : COLORS.darkGray,
  };

  const controlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  };

  const buttonStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: COLORS.electricPurple,
    color: COLORS.white,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    transition: 'all 0.2s ease',
  };

  const progressBarStyle = {
    flex: 1,
    height: '6px',
    borderRadius: BORDER_RADIUS.full,
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: COLORS.borderGray,
    outline: 'none',
    cursor: 'pointer',
  };

  const timeDisplayStyle = {
    ...TYPOGRAPHY.caption,
    color: isDarkMode ? COLORS.lightGray : COLORS.darkGray,
    margin: 0,
    minWidth: '50px',
    textAlign: 'right',
  };

  const volumeControlStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    borderTop: `1px solid ${COLORS.borderGray}`,
    paddingTop: SPACING.md,
  };

  const volumeSliderStyle = {
    width: '100px',
    height: '4px',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundColor: COLORS.borderGray,
    borderRadius: BORDER_RADIUS.full,
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <audio ref={audioRef} src={src} />

      <div style={headerStyle}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={artistStyle}>{artist}</p>
      </div>

      <div style={controlsStyle}>
        <button
          onClick={handlePlayPause}
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#7B1BA8')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.electricPurple)}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          style={progressBarStyle}
        />

        <p style={timeDisplayStyle}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      </div>

      <div style={volumeControlStyle}>
        <button
          onClick={handleMute}
          style={{
            ...buttonStyle,
            width: '32px',
            height: '32px',
            fontSize: '16px',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#7B1BA8')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = COLORS.electricPurple)}
        >
          {isMuted || volume === 0 ? '🔇' : '🔊'}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          style={volumeSliderStyle}
        />

        <span style={{ ...TYPOGRAPHY.caption, margin: 0, color: isDarkMode ? COLORS.lightGray : COLORS.darkGray }}>
          {Math.round(volume * 100)}%
        </span>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${COLORS.electricPurple};
          cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${COLORS.electricPurple};
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
