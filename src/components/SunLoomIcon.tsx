
interface SunLoomIconProps {
  className?: string;
  size?: number;
}

export default function SunLoomIcon({ className = "w-8 h-8", size }: SunLoomIconProps) {
  const iconSize = size || 32;
  
  return (
    <svg 
      className={className}
      width={iconSize} 
      height={iconSize} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer sun rays */}
      <g fill="currentColor">
        <rect x="15" y="1" width="2" height="4" rx="1"/>
        <rect x="23.5" y="3.8" width="2" height="4" rx="1" transform="rotate(45 24.5 5.8)"/>
        <rect x="27" y="15" width="4" height="2" rx="1"/>
        <rect x="23.5" y="24.2" width="2" height="4" rx="1" transform="rotate(135 24.5 26.2)"/>
        <rect x="15" y="27" width="2" height="4" rx="1"/>
        <rect x="6.5" y="24.2" width="2" height="4" rx="1" transform="rotate(-135 7.5 26.2)"/>
        <rect x="1" y="15" width="4" height="2" rx="1"/>
        <rect x="6.5" y="3.8" width="2" height="4" rx="1" transform="rotate(-45 7.5 5.8)"/>
      </g>
      
      {/* Central sun disk with loom pattern */}
      <circle cx="16" cy="16" r="9" fill="currentColor"/>
      
      {/* Loom weaving pattern inside */}
      <g fill="white" fillOpacity="0.9">
        {/* Horizontal threads */}
        <rect x="9" y="11" width="14" height="1" rx="0.5"/>
        <rect x="9" y="13" width="14" height="1" rx="0.5"/>
        <rect x="9" y="15" width="14" height="1" rx="0.5"/>
        <rect x="9" y="17" width="14" height="1" rx="0.5"/>
        <rect x="9" y="19" width="14" height="1" rx="0.5"/>
        <rect x="9" y="21" width="14" height="1" rx="0.5"/>
        
        {/* Vertical threads - creating weave pattern */}
        <rect x="11" y="9" width="1" height="6" rx="0.5"/>
        <rect x="13" y="15" width="1" height="6" rx="0.5"/>
        <rect x="15" y="9" width="1" height="6" rx="0.5"/>
        <rect x="17" y="15" width="1" height="6" rx="0.5"/>
        <rect x="19" y="9" width="1" height="6" rx="0.5"/>
        <rect x="21" y="15" width="1" height="6" rx="0.5"/>
      </g>
    </svg>
  );
}