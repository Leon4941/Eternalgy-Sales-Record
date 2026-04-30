import { IncentiveTripConfig } from './types';

export const BASE_COMMISSION_RATES = {
  internal: 0.03, // 3%
  outsource: 0.045, // 4.5%
};

export const OVERRIDING_RATES = [0.0025, 0.005, 0.01, 0.0125, 0.015, 0.0175, 0.02];

export const EP_MULTIPLIERS = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4];

export const EGA_CONFIG: IncentiveTripConfig = {
  name: "Eternalgy Glow Award (EGA)",
  deadline: "2026-06-30",
  epPointsTarget: {
    internal: 600000,
    outsource: 720000,
  }
};

export const ESA_CONFIG: IncentiveTripConfig = {
  name: "Eternalgy Supreme Award (ESA)",
  deadline: "2026-12-31",
  epPointsTarget: {
    internal: 1300000,
    outsource: 1560000,
  }
};

export const PROPERTY_TYPES = ["Residential", "Shoplot", "Industrial"];
export const PROGRESS_STATUSES = ["Deposit-5%", "2nd Payment-65%", "Complete-100%"];
