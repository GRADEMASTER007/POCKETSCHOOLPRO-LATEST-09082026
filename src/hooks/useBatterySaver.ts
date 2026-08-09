import { useState, useEffect } from 'react';

export function useBatterySaver() {
  const [batterySaverEnabled, setBatterySaverEnabled] = useState(() => {
    return localStorage.getItem('grade-master-battery-saver') === 'true';
  });
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    localStorage.setItem('grade-master-battery-saver', batterySaverEnabled.toString());
  }, [batterySaverEnabled]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryStatus = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
        };

        updateBatteryStatus();

        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);

        return () => {
          battery.removeEventListener('levelchange', updateBatteryStatus);
          battery.removeEventListener('chargingchange', updateBatteryStatus);
        };
      });
    }
  }, []);

  const shouldConserveBattery = batterySaverEnabled && batteryLevel !== null && batteryLevel < 20 && !isCharging;

  return {
    batterySaverEnabled,
    setBatterySaverEnabled,
    batteryLevel,
    isCharging,
    shouldConserveBattery,
  };
}
