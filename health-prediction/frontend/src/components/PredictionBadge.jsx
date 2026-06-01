import React from 'react';
import { ShieldCheck, AlertTriangle, Flame } from 'lucide-react';

const PredictionBadge = ({ result }) => {
  const getBadgeProps = () => {
    switch (result) {
      case 0:
        return {
          className: 'badge-risk-low',
          icon: <ShieldCheck size={16} />,
          text: 'Low Risk',
        };
      case 1:
        return {
          className: 'badge-risk-moderate',
          icon: <AlertTriangle size={16} />,
          text: 'Moderate Risk',
        };
      case 2:
        return {
          className: 'badge-risk-high pulse-high-indicator',
          icon: <Flame size={16} />,
          text: 'High Risk',
        };
      default:
        return {
          className: 'badge-secondary',
          icon: null,
          text: 'Unknown',
        };
    }
  };

  const { className, icon, text } = getBadgeProps();

  return (
    <span className={`badge-risk ${className}`}>
      {icon}
      <span>{text}</span>
    </span>
  );
};

export default PredictionBadge;
