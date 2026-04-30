export type SalesPersonType = 'internal' | 'outsource';
export type PropertyType = 'Residential' | 'Shoplot' | 'Industrial';
export type ProgressStatus = 'Deposit-5%' | '2nd Payment-65%' | 'Complete-100%';

export interface SalesPerson {
  uid: string;
  name: string;
  type: SalesPersonType;
  email: string;
}

export interface CustomerSale {
  id?: string;
  customerName: string;
  saleDate: string;
  propertyType: PropertyType;
  salesFigure: number;
  progress: ProgressStatus;
  progressDate: string;
  salesPersonId: string;
  salesPersonType: SalesPersonType;
  overridingRate: number; // e.g., 0.0025 for 0.25%
  extraCommission: number; // Contest commission
  epMultiplier: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncentiveTripConfig {
  name: string;
  deadline: string;
  epPointsTarget: {
    internal: number;
    outsource: number;
  };
}
