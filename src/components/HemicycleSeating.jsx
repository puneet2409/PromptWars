import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

const COLORS = {
  background: '#3A5A78', // Dark blue textured look from the image
  available: '#10B981',  // Bright green
  filled: '#EF4444',     // Red/Orange
  reserved: '#F3F4F6',   // White
  panel: '#4B7095',      // Lighter blue for panels
  text: '#FFFFFF',
};

const STATS = {
  available: 278,
  filled: 211,
  reserved: 0,
  total: 489
};

// Precompute static layout map outside of render to guarantee purity and maximum efficiency
const { initialSeats, computedAisles } = (() => {
  const generatedSeats = [];
  const rows = 12;
  const blocksWidth = [7, 11, 11, 7];
  
  const aisleAngle = 4 * (Math.PI / 180); 
  const totalAisles = 3;
  const totalAisleAngle = aisleAngle * totalAisles;
  
  const totalCols = 36;
  const availableAngle = Math.PI - totalAisleAngle;
  const anglePerCol = availableAngle / totalCols;

  const innerRadius = 160;
  const outerRadius = 450;
  const rowThickness = (outerRadius - innerRadius) / rows;

  let currentAngle = Math.PI; 
  const computedAislesLocal = [Math.PI]; // Leftmost edge is essentially Gate A

  blocksWidth.forEach((cols, bIndex) => {
    const blockSpan = cols * anglePerCol;
    
    for (let r = 0; r < rows; r++) {
      const radius = innerRadius + r * rowThickness;
      
      for (let c = 0; c < cols; c++) {
        const theta = currentAngle - (c + 0.5) * anglePerCol;
        
        const cx = 500 + radius * Math.cos(theta);
        const cy = 550 - radius * Math.sin(theta);
        
        let status = 'available';
        const randomFactor = Math.random();
        
        if (bIndex === 0) {
          status = randomFactor > 0.9 ? 'reserved' : 'available';
        } else if (bIndex === 1) {
          status = randomFactor > 0.85 ? 'reserved' : (randomFactor > 0.75 ? 'filled' : 'available');
        } else if (bIndex === 2) {
          status = randomFactor > 0.4 ? 'filled' : (randomFactor > 0.35 ? 'reserved' : 'available');
        } else if (bIndex === 3) {
          status = randomFactor > 0.9 ? 'reserved' : 'filled';
        }

        generatedSeats.push({
          id: `R${r}-B${bIndex}-C${c}`,
          cx,
          cy,
          theta,
          status,
          radius
        });
      }
    }
    
    currentAngle -= blockSpan;
    if (bIndex < 3) {
      computedAislesLocal.push(currentAngle - aisleAngle / 2); // Center of the aisle
      currentAngle -= aisleAngle;
    } else {
      computedAislesLocal.push(0); // Rightmost edge
    }
  });

  return { initialSeats: generatedSeats, computedAisles: computedAislesLocal };
})();

const StadiumSeating = () => {
  const { user } = useAuth();

  const seats = initialSeats;
  const aisles = computedAisles;
  const { targetSeatObj, targetPath, startGateAngle } = useMemo(() => {
    if (!user || !user.seat) return { targetSeatObj: null, targetPath: null, startGateAngle: null };
    
    const match = user.seat.match(/Sect\s(\d+),\sRow\s([A-Za-z]),\sSeat\s(\d+)/i);
    if (!match) return { targetSeatObj: null, targetPath: null, startGateAngle: null };
    
    const sect = parseInt(match[1], 10);
    const rowChar = match[2].toUpperCase();
    const seatNum = parseInt(match[3], 10);

    const r = Math.min(11, rowChar.charCodeAt(0) - 65);
    const bIndex = Math.min(3, Math.max(0, Math.floor((sect - 100) / 3)));
    
    const blocksWidth = [7, 11, 11, 7];
    const maxC = blocksWidth[bIndex] - 1;
    const c = Math.min(seatNum - 1, maxC);

    const seatId = `R${r}-B${bIndex}-C${c}`;
    const tgt = seats.find(s => s.id === seatId) || null;
    
    if (!tgt) return { targetSeatObj: null, targetPath: null, startGateAngle: null };

    // Closest aisle calculation
    const leftAisle = aisles[bIndex];
    const rightAisle = aisles[bIndex + 1];
    const closestAisle = Math.abs(tgt.theta - leftAisle) < Math.abs(tgt.theta - rightAisle) ? leftAisle : rightAisle;
    
    const rTarget = tgt.radius;
    const cx_aisle = 500 + rTarget * Math.cos(closestAisle);
    const cy_aisle = 550 - rTarget * Math.sin(closestAisle);
    const sweep = closestAisle > tgt.theta ? 1 : 0;
    
    const gateRadius = 490;
    const cx_gate = 500 + gateRadius * Math.cos(closestAisle);
    const cy_gate = 550 - gateRadius * Math.sin(closestAisle);
    
    const path = `M ${cx_gate} ${cy_gate} L ${cx_aisle} ${cy_aisle} A ${rTarget} ${rTarget} 0 0 ${sweep} ${tgt.cx} ${tgt.cy}`;
    
    return { targetSeatObj: tgt, targetPath: path, startGateAngle: closestAisle };
  }, [user, seats, aisles]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      backgroundColor: COLORS.background,
      fontFamily: 'sans-serif',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      position: 'relative',
      backgroundImage: `radial-gradient(circle at 50% 50%, #466A8C 0%, #29425A 100%)`
    }}>
      {/* Header Panel */}
      <div style={{
        backgroundColor: COLORS.panel,
        padding: '16px 24px',
        borderLeft: '4px solid #60A5FA',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h1 style={{ color: COLORS.text, margin: 0, fontSize: '28px', fontWeight: '500' }}>Division 1</h1>
      </div>

      <div style={{ position: 'relative', width: '100%', paddingBottom: '60%' }}>
        <svg 
          viewBox="0 0 1000 600" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          {/* Central Field Area */}
          <path d="M 340 550 A 160 160 0 0 1 660 550" fill="#064E3B" stroke="#10B981" strokeWidth="2" opacity="0.8" />
          <path d="M 360 550 A 140 140 0 0 1 640 550" fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
          <text x="500" y="520" textAnchor="middle" fill="#10B981" fontSize="18" fontWeight="800" letterSpacing="6" opacity="0.6">FIELD</text>

          {/* Navigation Path */}
          {targetPath && (
            <path 
              d={targetPath}
              fill="none" 
              stroke="#FBBF24"
              strokeWidth="4" 
              strokeDasharray="12 8"
            >
              <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
            </path>
          )}

          {/* Gates */}
          {aisles.map((angle, idx) => {
            const r = 490;
            const cx = 500 + r * Math.cos(angle);
            const cy = 550 - r * Math.sin(angle);
            const gateName = `Gate ${String.fromCharCode(65 + idx)}`;
            const rot = 90 - (angle * 180 / Math.PI);
            return (
              <g key={`gate-${idx}`} transform={`translate(${cx}, ${cy}) rotate(${rot})`}>
                <rect x="-24" y="-8" width="48" height="16" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
                <text y="3" textAnchor="middle" fill="#F8FAFC" fontSize="10" fontWeight="bold">{gateName}</text>
              </g>
            );
          })}

          {/* User Location Marker */}
          {targetSeatObj && targetPath && (
            <g transform={`translate(${ 500 + 490 * Math.cos(startGateAngle) }, ${ 550 - 490 * Math.sin(startGateAngle) })`}>
              <circle cx="0" cy="0" r="14" fill="#8B5CF6" stroke="#C4B5FD" strokeWidth="2" />
              <text y="-20" textAnchor="middle" fill="#C4B5FD" fontSize="12" fontWeight="bold">YOU</text>
            </g>
          )}

          {/* Seats rendering */}
          {seats.map((seat) => {
            const isTarget = targetSeatObj && targetSeatObj.id === seat.id;
            
            let fillColor = COLORS.available;
            if (seat.status === 'filled') fillColor = COLORS.filled;
            if (seat.status === 'reserved') fillColor = COLORS.reserved;
            
            if (isTarget) {
              fillColor = '#FBBF24'; // Highlight target seat with Amber color
            }

            const rectWidth = isTarget ? 20 : 14;
            const rectHeight = isTarget ? 18 : 12;
            const rotationDegree = 90 - (seat.theta * 180 / Math.PI);

            return (
              <g key={seat.id} transform={`translate(${seat.cx}, ${seat.cy}) rotate(${rotationDegree})`}>
                <rect 
                  x={-rectWidth/2} 
                  y={-rectHeight/2} 
                  width={rectWidth} 
                  height={rectHeight} 
                  rx={2}
                  fill={fillColor} 
                  stroke={isTarget ? "#FFFFFF" : "rgba(0,0,0,0.2)"}
                  strokeWidth={isTarget ? "2" : "1"}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {isTarget && (
                  <circle cx="0" cy="0" r="28" fill="none" stroke="#FBBF24" strokeWidth="2">
                    <animate attributeName="r" values="18;32;18" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats Panel (Bottom Center) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{ backgroundColor: COLORS.panel, padding: '12px 24px', borderRadius: '6px', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
          <span style={{ color: COLORS.available, fontWeight: 'bold', fontSize: '15px' }}>AVAILABLE</span>
          <span style={{ color: COLORS.text, fontWeight: 'bold', fontSize: '18px' }}>278</span>
        </div>
        <div style={{ backgroundColor: COLORS.panel, padding: '12px 24px', borderRadius: '6px', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
          <span style={{ color: COLORS.filled, fontWeight: 'bold', fontSize: '15px' }}>FILLED</span>
          <span style={{ color: COLORS.text, fontWeight: 'bold', fontSize: '18px' }}>211</span>
        </div>
      </div>
    </div>
  );
};

export default StadiumSeating;
