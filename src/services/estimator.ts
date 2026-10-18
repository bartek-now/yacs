import { Nutrition } from '../domain/meals';

export type PhotoInput = { uri: string; notes: string };
export type Estimate = { name: string; nutrition: Nutrition; source: 'demo'; explanation: string };
export interface MealEstimator {
  estimate: (input: PhotoInput) => Promise<Estimate>;
}

// Deliberately deterministic. A future backend adapter must keep API secrets off the device.
export const demoEstimator: MealEstimator = {
  async estimate({ uri }) {
    if (!uri) throw new Error('Choose a photo first.');
    return {
      name: 'Demo meal',
      nutrition: { calories: 520, protein: 35, carbs: 50, fat: 20 },
      source: 'demo',
      explanation:
        'Sample values only — your photo has not been analyzed. Edit every value before using this as a real meal.',
    };
  },
};
