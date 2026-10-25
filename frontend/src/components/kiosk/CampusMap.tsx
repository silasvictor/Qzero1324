import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Kiosk } from '../../types';
import { MapPin, Printer, Zap, BatteryCharging, Check } from 'lucide-react';

interface CampusMapProps {
  kiosks: Kiosk[];
  selectedKioskId?: string;
  onSelectKiosk: (kiosk: Kiosk) => void;
}

// Custom Leaflet marker icons with purple branding
const createKioskIcon = (isSelected: boolean, status: string) => {
  const bg = isSelected ? '#5526CC' : status === 'BUSY' ? '#F59E0B' : '#7047EB';
  const size = isSelected ? 42 : 36;

  const html = `
    <div style="
      background-color: ${bg};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(112, 71, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">
      🖨️
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-kiosk-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 17);
  }, [center, map]);
  return null;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  kiosks,
  selectedKioskId,
  onSelectKiosk,
}) => {
  // Center on VIT-AP University campus exact centroid of the 6 indoor printer buildings
  const defaultCenter: [number, number] = [16.4945, 80.4989];

  const activeKiosk = kiosks.find((k) => k.id === selectedKioskId) || kiosks[0];
  const centerPos: [number, number] = activeKiosk
    ? [activeKiosk.latitude, activeKiosk.longitude]
    : defaultCenter;

  return (
    <div className="w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden border border-brand-cardBorder shadow-soft relative z-10">
      <MapContainer
        center={defaultCenter}
        zoom={17}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={centerPos} />

        {kiosks.map((kiosk) => {
          const isSelected = kiosk.id === selectedKioskId;

          return (
            <Marker
              key={kiosk.id}
              position={[kiosk.latitude, kiosk.longitude]}
              icon={createKioskIcon(isSelected, kiosk.status)}
              eventHandlers={{
                click: () => onSelectKiosk(kiosk),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 max-w-[220px] text-xs font-sans">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <strong className="text-brand-dark text-xs">{kiosk.name}</strong>
                    <span className="text-[9px] bg-purple-100 text-brand-purple px-1.5 py-0.5 rounded font-mono font-bold">
                      {kiosk.campusCode}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mb-1.5">
                    <span>🏢</span>
                    <span>Inside Building • Indoor Kiosk</span>
                  </div>

                  <div className="text-[10px] text-gray-500 mb-2 leading-tight">{kiosk.location}</div>

                  <div className="space-y-1 text-[10px] text-gray-600 mb-2">
                    <div className="flex justify-between">
                      <span>Queue:</span>
                      <strong className="text-brand-dark">{kiosk.queueDepth} jobs</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Paper:</span>
                      <span className="text-green-600 font-bold">{kiosk.paperLevelPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Toner:</span>
                      <span className="text-indigo-600 font-bold">{kiosk.tonerLevelPercent}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectKiosk(kiosk)}
                    className="w-full py-1.5 px-2 bg-brand-purple hover:bg-brand-deep text-white font-bold rounded-lg text-[10px] transition-colors"
                  >
                    {isSelected ? '✓ Selected' : 'Select Kiosk'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
