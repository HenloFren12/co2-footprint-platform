// lib/personaData.ts
import { Persona } from './personaNarrative';

const PERSONAS: Record<string, Persona> = {
  arjun: {
    id: 'arjun',
    name: 'Arjun',
    age: 44,
    occupation: 'rice farmer',
    location: 'Bihar, India',
    climateImpact: 'Monsoon unpredictability causing crop failure',
    portraitBackground: 'Cracked dry paddy field',
    impactMetric: 'unpredictable monsoon',
    impactDescription:
      'worsening monsoon patterns that destroy rice harvests across Bihar',
    closingLine:
      'Every choice you make ripples here to Bihar.',
    weeklyAction: 'Skip one meat meal this week',
    avatarUrl: '/arjun.jpg',
  },
  amara: {
    id: 'amara',
    name: 'Amara',
    age: 31,
    occupation: 'coastal fisherwoman',
    location: 'Lagos, Nigeria',
    climateImpact: 'Rising seas displacing her community',
    portraitBackground: 'Flooded shoreline with fishing nets',
    impactMetric: 'coastal flooding',
    impactDescription:
      'rising sea levels that are swallowing fishing communities in Lagos',
    closingLine:
      'The ocean remembers every carbon choice made on land.',
    weeklyAction: 'Choose plant-based protein once this week',
    avatarUrl: '/amara.jpg',
  },
  lena: {
    id: 'lena',
    name: 'Lena',
    age: 38,
    occupation: 'wildfire firefighter',
    location: 'British Columbia, Canada',
    climateImpact: 'Six-month fire season',
    portraitBackground: 'Smoke-filled forest treeline',
    impactMetric: 'wildfire season length',
    impactDescription:
      'longer and more intense wildfire seasons across British Columbia',
    closingLine:
      'I fight fires you help start. Help me fight less.',
    weeklyAction: 'Use public transit for one trip today',
    avatarUrl: '/lena.jpg',
  },
  ibrahim: {
    id: 'ibrahim',
    name: 'Ibrahim',
    age: 52,
    occupation: 'pastoralist',
    location: 'Sahel, Mali',
    climateImpact: 'Desertification and water scarcity',
    portraitBackground: 'Sparse dry savanna with livestock',
    impactMetric: 'days without water',
    impactDescription:
      'spreading desertification that is consuming grazing land in the Sahel',
    closingLine:
      'My cattle and I walk further every year for water.',
    weeklyAction: 'Reduce shower time by 2 minutes today',
    avatarUrl: '/ibrahim.jpg',
  },
  mei: {
    id: 'mei',
    name: 'Mei',
    age: 29,
    occupation: 'coral reef researcher',
    location: 'Maldives',
    climateImpact: 'Coral bleaching and tourism collapse',
    portraitBackground: 'Bleached coral underwater',
    impactMetric: 'coral bleaching events',
    impactDescription:
      'ocean warming that is bleaching and killing coral reefs in the Maldives',
    closingLine:
      'I document what is dying. You can slow the dying.',
    weeklyAction: 'Turn off appliances on standby today',
    avatarUrl: '/mei.jpg',
  },
  sofia: {
    id: 'sofia',
    name: 'Sofia',
    age: 67,
    occupation: 'asthma patient',
    location: 'Madrid, Spain',
    climateImpact: 'Heat waves and declining air quality',
    portraitBackground: 'Hazy urban street scene',
    impactMetric: 'poor air quality days',
    impactDescription:
      'worsening air quality and heat waves that trigger respiratory crises in Madrid',
    closingLine:
      'Every car trip someone skips means one easier breath for me.',
    weeklyAction: 'Walk or cycle for one short trip today',
    avatarUrl: '/sofia.jpg',
  },
  tariq: {
    id: 'tariq',
    name: 'Tariq',
    age: 41,
    occupation: 'glacier hydrologist',
    location: 'Hindu Kush, Pakistan',
    climateImpact: 'Glacial melt causing downstream flooding',
    portraitBackground: 'Shrinking glacier',
    impactMetric: 'glacial retreat',
    impactDescription:
      'accelerating glacial melt that threatens water supplies for millions downstream',
    closingLine:
      'These glaciers are the water towers of Asia. They are melting.',
    weeklyAction: 'Reduce your electricity use by 10% today',
    avatarUrl: '/tariq.jpg',
  },
  hana: {
    id: 'hana',
    name: 'Hana',
    age: 35,
    occupation: 'subsistence farmer',
    location: 'Ethiopia',
    climateImpact: 'Drought cycles and food insecurity',
    portraitBackground: 'Dry cracked earth with sparse crops',
    impactMetric: 'failed harvest days',
    impactDescription:
      'intensifying drought cycles that are destroying subsistence harvests in Ethiopia',
    closingLine:
      'My children go hungry when the rains do not come.',
    weeklyAction: 'Choose locally grown food this week',
    avatarUrl: '/hana.jpg',
  },
};

export default PERSONAS;