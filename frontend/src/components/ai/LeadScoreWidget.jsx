// Author: Praket | Module: AI Components | CRM Platform v1.0

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

/**
 * Animated SVG Score Ring — Signature visual element
 * Thin circular progress arc with electric violet glow
 */
export default function LeadScoreWidget({ leadId, initialScore, initialConfidence, initialFactors }) {
  const [score, setScore] = useState(initialScore || 0);
  const [confidence, setConfidence] = useState(initialConfidence || null);
  const [keyFactors, setKeyFactors] = useState(initialFactors || []);
  const [isScoring, setIsScoring] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 75) return '#22C55E';
    if (s >= 50) return '#F59E0B';
    if (s >= 25) return '#6C63FF';
    return '#EF4444';
  };

  const refreshScore = async () => {
    if (!leadId) return;
    setIsScoring(true);
    try {
      const res = await api.post('/ai/score-lead', { leadId });
      const data = res.data.data;
      setScore(data.score);
      setConfidence(data.confidence);
      setKeyFactors(data.key_factors || []);
      setAnimKey((k) => k + 1); // retrigger animation
      toast.success(`Score updated: ${data.score}/100`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Scoring failed');
    } finally {
      setIsScoring(false);
    }
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="flex flex-col items-center">
      {/* SVG Score Ring */}
      <div className="relative w-32 h-32">
        <svg key={animKey} viewBox="0 0 100 100" className="w-full h-full" style={{ filter: `drop-shadow(0 0 8px ${scoreColor}40)` }}>
          {/* Background ring */}
          <circle className="score-ring-bg" cx="50" cy="50" r={radius} />

          {/* Animated progress ring */}
          <circle
            className="score-ring-fill"
            cx="50"
            cy="50"
            r={radius}
            stroke={scoreColor}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 8px ${scoreColor}60)`,
              animation: `score-ring-fill 1.2s ease-out forwards, score-glow-pulse 3s ease-in-out infinite`,
            }}
          />

          {/* Score number */}
          <text
            x="50"
            y="46"
            textAnchor="middle"
            className="score-number"
            fontSize="22"
            fill="#F1F1F5"
          >
            {score}
          </text>

          {/* Label */}
          <text
            x="50"
            y="62"
            textAnchor="middle"
            fontSize="8"
            fill="#8B8B9E"
            fontFamily="Inter, sans-serif"
          >
            AI SCORE
          </text>
        </svg>
      </div>

      {/* Confidence badge */}
      {confidence && (
        <span className={`mt-2 badge text-xs ${
          confidence === 'HIGH' ? 'badge-success' :
          confidence === 'MEDIUM' ? 'badge-warning' : 'badge-danger'
        }`}>
          {confidence} Confidence
        </span>
      )}

      {/* Refresh button */}
      <button
        onClick={refreshScore}
        disabled={isScoring || !leadId}
        className="mt-3 btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50"
      >
        <RefreshCw size={12} className={isScoring ? 'animate-spin' : ''} />
        {isScoring ? 'Scoring...' : 'Refresh Score'}
      </button>

      {/* Key factors */}
      {keyFactors.length > 0 && (
        <div className="mt-4 w-full space-y-1.5">
          <p className="text-xs text-text-secondary font-medium">Key Factors</p>
          {keyFactors.map((factor, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: scoreColor }} />
              <span className="text-text-primary">{factor}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
