
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface DayNightSettings {
  timeOfDay: TimeOfDay;
  skyColor: number;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  directionalLightColor: number;
  buildingLightsOn: boolean;
}

export const TIME_SETTINGS: Record<TimeOfDay, DayNightSettings> = {
  dawn: {
    timeOfDay: 'dawn',
    skyColor: 0xffd4b3, // Warm orange dawn
    ambientLightIntensity: 0.4,
    directionalLightIntensity: 0.6,
    directionalLightColor: 0xffd6aa,
    buildingLightsOn: true,
  },
  day: {
    timeOfDay: 'day',
    skyColor: 0xf0f5ff, // Light blue day
    ambientLightIntensity: 0.6,
    directionalLightIntensity: 0.8,
    directionalLightColor: 0xffffff,
    buildingLightsOn: false,
  },
  dusk: {
    timeOfDay: 'dusk',
    skyColor: 0xb1a0c8, // Purple-ish dusk
    ambientLightIntensity: 0.3,
    directionalLightIntensity: 0.5,
    directionalLightColor: 0xff9955,
    buildingLightsOn: true,
  },
  night: {
    timeOfDay: 'night',
    skyColor: 0x0c1445, // Dark blue night
    ambientLightIntensity: 0.2,
    directionalLightIntensity: 0.1,
    directionalLightColor: 0xc2d1ff, // Moonlight color
    buildingLightsOn: true,
  }
};

export const getNextTimeOfDay = (current: TimeOfDay): TimeOfDay => {
  const times: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];
  const currentIndex = times.indexOf(current);
  return times[(currentIndex + 1) % times.length];
};
