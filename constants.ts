import { BreathingPattern } from './types';
import React from 'react';

// Icons as SVG components using React.createElement for .ts file compatibility
const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round" as "round",
  strokeLinejoin: "round" as "round"
};

const path = (d: string) => React.createElement('path', { d, key: d });

export const Icons = {
  Wind: () => React.createElement('svg', svgProps, [
    path("M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"),
    path("M9.6 4.6A2 2 0 1 1 11 8H2"),
    path("M12.6 19.4A2 2 0 1 0 14 16H2")
  ]),
  Moon: () => React.createElement('svg', svgProps, [
    path("M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z")
  ]),
  Sun: () => React.createElement('svg', svgProps, [
    React.createElement('circle', { cx: "12", cy: "12", r: "4", key: "c" }),
    path("M12 2v2"),
    path("M12 20v2"),
    path("m4.93 4.93 1.41 1.41"),
    path("m17.66 17.66 1.41 1.41"),
    path("M2 12h2"),
    path("M20 12h2"),
    path("m6.34 17.66-1.41 1.41"),
    path("m19.07 4.93-1.41 1.41")
  ]),
  Box: () => React.createElement('svg', svgProps, [
    path("M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"),
    path("m3.3 7 8.7 5 8.7-5"),
    path("M12 22V12")
  ]),
  Sparkles: () => React.createElement('svg', svgProps, [
    path("m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"),
    path("M5 3v4"),
    path("M9 3v4"),
    path("M3 5h4"),
    path("M3 9h4")
  ]),
  ArrowLeft: () => React.createElement('svg', svgProps, [
    path("m12 19-7-7 7-7"),
    path("M19 12H5")
  ]),
  X: () => React.createElement('svg', svgProps, [
    path("M18 6 6 18"),
    path("m6 6 12 12")
  ])
};

export const DEFAULT_PATTERNS: BreathingPattern[] = [
  {
    id: 'box-breathing',
    name: '박스 호흡법',
    description: '네이비 씰이 극도의 스트레스 상황에서 평정심을 유지하기 위해 사용하는 호흡법입니다.',
    benefit: '집중력 & 스트레스 완화',
    inhale: 4,
    holdTop: 4,
    exhale: 4,
    holdBottom: 4,
    tags: ['집중', '불안 해소'],
  },
  {
    id: '4-7-8',
    name: '4-7-8 휴식 호흡',
    description: '앤드류 와일 박사가 고안한 호흡법으로, 신경계를 위한 천연 진정제 역할을 합니다.',
    benefit: '수면 & 불안 완화',
    inhale: 4,
    holdTop: 7,
    exhale: 8,
    holdBottom: 0,
    tags: ['수면', '이완'],
  },
  {
    id: 'coherent',
    name: '공명 호흡 (Coherent)',
    description: '분당 5회 호흡하여 심박변이도(HRV)를 극대화하고 자율신경계 균형을 맞춥니다.',
    benefit: '균형 & 회복',
    inhale: 6,
    holdTop: 0,
    exhale: 6,
    holdBottom: 0,
    tags: ['균형', '데일리'],
  },
  {
    id: 'energizing',
    name: '활력 호흡',
    description: '짧고 강한 들숨과 날숨을 통해 몸과 마음을 깨우고 에너지를 공급합니다.',
    benefit: '에너지 & 각성',
    inhale: 2,
    holdTop: 0,
    exhale: 2,
    holdBottom: 0,
    tags: ['에너지', '아침'],
  }
];