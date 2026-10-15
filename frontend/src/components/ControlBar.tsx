import React, { useEffect } from 'react'
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FastForward,
} from 'lucide-react'

interface ControlBarProps {
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  onTogglePlay: () => void
  onPrevStep: () => void
  onNextStep: () => void
  onRestart: () => void
  onJumpToEnd: () => void
  onSeek: (step: number) => void
  speed: number
  setSpeed: (speed: number) => void
}

export const ControlBar: React.FC<ControlBarProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onTogglePlay,
  onPrevStep,
  onNextStep,
  onRestart,
  onJumpToEnd,
  onSeek,
  speed,
  setSpeed,
}) => {
  // Global keyboard shortcuts for execution playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

      if (e.code === 'Space') {
        e.preventDefault()
        onTogglePlay()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        onPrevStep()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        onNextStep()
      } else if (e.code === 'Home') {
        e.preventDefault()
        onRestart()
      } else if (e.code === 'End') {
        e.preventDefault()
        onJumpToEnd()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onTogglePlay, onPrevStep, onNextStep, onRestart, onJumpToEnd])

  const progressPercent = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0

  return (
    <div
      className="glass-panel"
      style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        background: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Transport buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          className="btn btn-secondary btn-icon"
          onClick={onRestart}
          disabled={totalSteps === 0 || currentStep === 0}
          title="Restart (Home)"
        >
          <RotateCcw size={15} />
        </button>

        <button
          className="btn btn-secondary btn-icon"
          onClick={onPrevStep}
          disabled={totalSteps === 0 || currentStep === 0}
          title="Previous Step (Left Arrow)"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          className="btn btn-primary btn-icon"
          onClick={onTogglePlay}
          disabled={totalSteps === 0}
          style={{ width: 40, height: 40 }}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>

        <button
          className="btn btn-secondary btn-icon"
          onClick={onNextStep}
          disabled={totalSteps === 0 || currentStep >= totalSteps - 1}
          title="Next Step (Right Arrow)"
        >
          <ChevronRight size={18} />
        </button>

        <button
          className="btn btn-secondary btn-icon"
          onClick={onJumpToEnd}
          disabled={totalSteps === 0 || currentStep >= totalSteps - 1}
          title="Jump to End (End)"
        >
          <FastForward size={15} />
        </button>
      </div>

      {/* Step Scrubber & Progress Bar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Timeline Navigation</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f1f5f9' }}>
            Step {totalSteps > 0 ? currentStep + 1 : 0} of {totalSteps} ({Math.round(progressPercent)}%)
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => onSeek(Number(e.target.value))}
          disabled={totalSteps === 0}
          style={{
            width: '100%',
            accentColor: 'var(--accent-indigo)',
            cursor: totalSteps > 0 ? 'pointer' : 'default',
            height: 5,
          }}
        />
      </div>

      {/* Playback Speed Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.4)', padding: 3, borderRadius: 8 }}>
        <span style={{ fontSize: 10, color: '#64748b', padding: '0 4px', fontWeight: 600 }}>Speed:</span>
        {[0.5, 1, 2, 4].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            style={{
              background: speed === s ? 'var(--accent-indigo)' : 'transparent',
              color: speed === s ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: 6,
              padding: '3px 7px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.15s ease',
            }}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}
