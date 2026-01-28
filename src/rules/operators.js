/**
 * Custom operators for json-rules-engine
 * Extends the engine with domain-specific comparison logic
 */

/**
 * daysSince - Calculates days since a given date
 * Usage: { fact: 'lastWorkoutDate', operator: 'daysSince', value: 3 }
 * Returns true if the number of days since the date is >= value
 */
export const daysSinceOperator = {
  name: 'daysSince',
  callback: (factValue, jsonValue) => {
    if (!factValue) return true; // No date means infinite days
    const date = new Date(factValue);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= jsonValue;
  }
};

/**
 * daysSinceLessThan - Returns true if days since date is less than value
 */
export const daysSinceLessThanOperator = {
  name: 'daysSinceLessThan',
  callback: (factValue, jsonValue) => {
    if (!factValue) return false;
    const date = new Date(factValue);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < jsonValue;
  }
};

/**
 * containsAny - Checks if an array contains any of the specified values
 * Usage: { fact: 'painAreas', operator: 'containsAny', value: ['lower_back', 'knee'] }
 */
export const containsAnyOperator = {
  name: 'containsAny',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue) || !Array.isArray(jsonValue)) return false;
    return jsonValue.some(item => factValue.includes(item));
  }
};

/**
 * containsAll - Checks if an array contains all of the specified values
 */
export const containsAllOperator = {
  name: 'containsAll',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue) || !Array.isArray(jsonValue)) return false;
    return jsonValue.every(item => factValue.includes(item));
  }
};

/**
 * notContains - Checks if an array does not contain a value
 */
export const notContainsOperator = {
  name: 'notContains',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue)) return true;
    return !factValue.includes(jsonValue);
  }
};

/**
 * averageLessThan - Checks if average of array is less than value
 * Usage: { fact: 'recentRPEs', operator: 'averageLessThan', value: 5 }
 */
export const averageLessThanOperator = {
  name: 'averageLessThan',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue) || factValue.length === 0) return false;
    const avg = factValue.reduce((a, b) => a + b, 0) / factValue.length;
    return avg < jsonValue;
  }
};

/**
 * averageGreaterThan - Checks if average of array is greater than value
 */
export const averageGreaterThanOperator = {
  name: 'averageGreaterThan',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue) || factValue.length === 0) return false;
    const avg = factValue.reduce((a, b) => a + b, 0) / factValue.length;
    return avg > jsonValue;
  }
};

/**
 * averageBetween - Checks if average is between two values
 * Usage: { fact: 'recentRPEs', operator: 'averageBetween', value: { min: 5, max: 7 } }
 */
export const averageBetweenOperator = {
  name: 'averageBetween',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue) || factValue.length === 0) return false;
    const avg = factValue.reduce((a, b) => a + b, 0) / factValue.length;
    return avg >= jsonValue.min && avg <= jsonValue.max;
  }
};

/**
 * trendDirection - Analyzes trend direction of values
 * Usage: { fact: 'recentScores', operator: 'trendDirection', value: 'increasing' }
 * Values: 'increasing', 'decreasing', 'stable'
 */
export const trendDirectionOperator = {
  name: 'trendDirection',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue) || factValue.length < 3) return jsonValue === 'stable';

    // Calculate linear regression slope
    const n = factValue.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += factValue[i];
      sumXY += i * factValue[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const threshold = 0.1; // Sensitivity threshold

    if (slope > threshold) {
      return jsonValue === 'increasing';
    } else if (slope < -threshold) {
      return jsonValue === 'decreasing';
    } else {
      return jsonValue === 'stable';
    }
  }
};

/**
 * countGreaterThan - Counts items in array greater than threshold
 * Usage: { fact: 'painIntensities', operator: 'countGreaterThan', value: { threshold: 3, count: 2 } }
 */
export const countGreaterThanOperator = {
  name: 'countGreaterThan',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue)) return false;
    const count = factValue.filter(v => v > jsonValue.threshold).length;
    return count >= jsonValue.count;
  }
};

/**
 * percentageGreaterThan - Checks if percentage of values exceed threshold
 * Usage: { fact: 'completionRates', operator: 'percentageGreaterThan', value: { threshold: 80, percentage: 70 } }
 */
export const percentageGreaterThanOperator = {
  name: 'percentageGreaterThan',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue) || factValue.length === 0) return false;
    const count = factValue.filter(v => v > jsonValue.threshold).length;
    const percentage = (count / factValue.length) * 100;
    return percentage >= jsonValue.percentage;
  }
};

/**
 * inRange - Checks if value is within a range
 * Usage: { fact: 'readinessScore', operator: 'inRange', value: { min: 40, max: 70 } }
 */
export const inRangeOperator = {
  name: 'inRange',
  callback: (factValue, jsonValue) => {
    return factValue >= jsonValue.min && factValue <= jsonValue.max;
  }
};

/**
 * ageInCategory - Checks if user age falls in a category
 * Usage: { fact: 'age', operator: 'ageInCategory', value: 'senior' }
 */
export const ageInCategoryOperator = {
  name: 'ageInCategory',
  callback: (factValue, jsonValue) => {
    const categories = {
      young: { min: 0, max: 29 },
      adult: { min: 30, max: 49 },
      mature: { min: 50, max: 64 },
      senior: { min: 65, max: 150 }
    };
    const category = categories[jsonValue];
    if (!category) return false;
    return factValue >= category.min && factValue <= category.max;
  }
};

/**
 * consecutiveCount - Counts consecutive occurrences of a condition
 * Usage: { fact: 'recentSessionsSkipped', operator: 'consecutiveCount', value: 3 }
 */
export const consecutiveCountOperator = {
  name: 'consecutiveCount',
  callback: (factValue, jsonValue) => {
    if (!Array.isArray(factValue)) return false;
    let maxConsecutive = 0;
    let current = 0;

    for (const val of factValue) {
      if (val) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 0;
      }
    }

    return maxConsecutive >= jsonValue;
  }
};

// Export all operators as an array for easy registration
export const allOperators = [
  daysSinceOperator,
  daysSinceLessThanOperator,
  containsAnyOperator,
  containsAllOperator,
  notContainsOperator,
  averageLessThanOperator,
  averageGreaterThanOperator,
  averageBetweenOperator,
  trendDirectionOperator,
  countGreaterThanOperator,
  percentageGreaterThanOperator,
  inRangeOperator,
  ageInCategoryOperator,
  consecutiveCountOperator
];
