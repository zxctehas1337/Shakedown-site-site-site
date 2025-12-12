import { FEATURES } from '../constants/features'

interface FeatureSliderProps {
  currentFeature: number
  setCurrentFeature: (index: number) => void
}

export function FeatureSlider({ currentFeature, setCurrentFeature }: FeatureSliderProps) {
  return (
    <div className="auth-left-panel">
      <div className="slider-content">
        <div className="feature-icon">
          {FEATURES[currentFeature].icon}
        </div>
        <h2 className="feature-title fade-in-text" key={`title-${currentFeature}`}>
          {FEATURES[currentFeature].title}
        </h2>
        <p className="feature-description fade-in-text" key={`desc-${currentFeature}`}>
          {FEATURES[currentFeature].description}
        </p>

        <div className="slider-dots">
          {FEATURES.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === currentFeature ? 'active' : ''}`}
              onClick={() => setCurrentFeature(index)}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="auth-bg-overlay"></div>
    </div>
  )
}
