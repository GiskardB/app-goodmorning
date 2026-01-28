import {
  GOAL_LABELS,
  EXPERIENCE_LABELS,
  GENDER_LABELS,
  MENSTRUAL_PHASE_LABELS,
  BODY_AREA_LABELS,
  CONDITION_LABELS,
  RPE_SCALE,
  READINESS_COLORS,
  READINESS_LABELS,
  PROGRESSION_LABELS
} from './constants';
import { getReadinessLevel } from './calculations';

/**
 * Format seconds to MM:SS string
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Formatted time string
 */
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to human readable duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} Human readable duration
 */
export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes} min`;
  return `${minutes} min ${remainingSeconds} sec`;
}

/**
 * Format date to Italian locale
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  return new Date(date).toLocaleDateString('it-IT', { ...defaultOptions, ...options });
}

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date with time
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format relative time (e.g., "2 giorni fa")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Adesso';
  if (diffMinutes < 60) return `${diffMinutes} min fa`;
  if (diffHours < 24) return `${diffHours} ore fa`;
  if (diffDays === 1) return 'Ieri';
  if (diffDays < 7) return `${diffDays} giorni fa`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} settimane fa`;
  return formatDate(date);
}

/**
 * Format goal to label
 * @param {string} goal - Goal key
 * @returns {string} Goal label
 */
export function formatGoal(goal) {
  return GOAL_LABELS[goal] || goal;
}

/**
 * Format experience level to label
 * @param {string} level - Experience level key
 * @returns {string} Experience label
 */
export function formatExperience(level) {
  return EXPERIENCE_LABELS[level] || level;
}

/**
 * Format gender to label
 * @param {string} gender - Gender key
 * @returns {string} Gender label
 */
export function formatGender(gender) {
  return GENDER_LABELS[gender] || gender;
}

/**
 * Format menstrual phase to label
 * @param {string} phase - Phase key
 * @returns {string} Phase label
 */
export function formatMenstrualPhase(phase) {
  return MENSTRUAL_PHASE_LABELS[phase] || phase;
}

/**
 * Format body area to label
 * @param {string} area - Body area key
 * @returns {string} Area label
 */
export function formatBodyArea(area) {
  return BODY_AREA_LABELS[area] || area;
}

/**
 * Format condition to label
 * @param {string} condition - Condition key
 * @returns {string} Condition label
 */
export function formatCondition(condition) {
  return CONDITION_LABELS[condition] || condition;
}

/**
 * Format RPE value with description
 * @param {number} rpe - RPE value (1-10)
 * @returns {object} RPE info with label and description
 */
export function formatRPE(rpe) {
  return RPE_SCALE[rpe] || { label: 'Sconosciuto', description: '' };
}

/**
 * Format readiness score with color and label
 * @param {number} score - Readiness score (0-100)
 * @returns {object} Readiness info with color, label, and level
 */
export function formatReadiness(score) {
  const level = getReadinessLevel(score);
  const colorKey = level.toUpperCase();
  return {
    score,
    level,
    color: READINESS_COLORS[colorKey],
    label: READINESS_LABELS[colorKey]
  };
}

/**
 * Format progression action to label
 * @param {string} action - Progression action key
 * @returns {string} Action label
 */
export function formatProgressionAction(action) {
  return PROGRESSION_LABELS[action] || action;
}

/**
 * Format BMI with category
 * @param {number} bmi - BMI value
 * @param {object} category - BMI category
 * @returns {string} Formatted BMI string
 */
export function formatBMI(bmi, category) {
  return `${bmi} (${category.label})`;
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format weight
 * @param {number} kg - Weight in kilograms
 * @returns {string} Formatted weight
 */
export function formatWeight(kg) {
  return `${kg} kg`;
}

/**
 * Format height
 * @param {number} cm - Height in centimeters
 * @returns {string} Formatted height
 */
export function formatHeight(cm) {
  return `${cm} cm`;
}

/**
 * Format list of items
 * @param {string[]} items - Array of items
 * @param {function} formatter - Optional formatter function
 * @returns {string} Comma-separated list
 */
export function formatList(items, formatter = null) {
  if (!items || items.length === 0) return '-';
  const formatted = formatter ? items.map(formatter) : items;
  return formatted.join(', ');
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Format number with Italian locale
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 0) {
  return num.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
