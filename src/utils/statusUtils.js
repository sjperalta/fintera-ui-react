// src/utils/statusUtils.js

/**
 * Utility functions for handling status labels, colors, and styling
 * Centralizes all status-related logic for consistency across components
 */

export const STATUS_CONFIG = {
  available: {
    label: 'Disponible',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    priority: 1
  },
  reserved: {
    label: 'Reservado',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    priority: 2
  },
  sold: {
    label: 'Financiado',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    priority: 3
  },
  financed: {
    label: 'Financiado',
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    priority: 3
  },
  pending: {
    label: 'Pendiente',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    priority: 4
  },
  approved: {
    label: 'Aprobado',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    priority: 5
  },
  rejected: {
    label: 'Rechazado',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    priority: 6
  },
  cancelled: {
    label: 'Cancelado',
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    priority: 7
  },
  closed: {
    label: 'Pagado',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    priority: 8
  },
  fully_paid: {
    label: 'Pagado',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    priority: 8
  }
};

/**
 * Get the display label for a status
 * @param {string} status - The status key
 * @returns {string} - The translated label or fallback
 */
export const getStatusLabel = (status) => {
  if (!status) return 'Desconocido';

  const statusKey = String(status).toLowerCase().trim();
  const config = STATUS_CONFIG[statusKey];

  if (config) {
    return config.label;
  }

  // Fallback to formatStatus for statuses not in config
  const { formatStatus } = require('./formatStatus');
  return formatStatus(status);
};

/**
 * Get the badge CSS classes for a status
 * @param {string} status - The status key
 * @returns {string} - The CSS classes for the badge
 */
export const getStatusBadgeClass = (status) => {
  if (!status) return 'bg-gray-100 dark:bg-darkblack-500';

  const statusKey = String(status).toLowerCase().trim();
  const config = STATUS_CONFIG[statusKey];

  if (config) {
    return `block rounded-md px-4 py-1.5 text-sm font-semibold leading-[22px] ${config.badgeClass}`;
  }

  // Default badge class for unknown statuses
  return 'block rounded-md px-4 py-1.5 text-sm font-semibold leading-[22px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
};

/**
 * Get the full status configuration for a status
 * @param {string} status - The status key
 * @returns {object} - The status configuration object
 */
export const getStatusConfig = (status) => {
  if (!status) return null;

  const statusKey = String(status).toLowerCase().trim();
  return STATUS_CONFIG[statusKey] || null;
};

/**
 * Check if a status is considered "active" (available for actions)
 * @param {string} status - The status key
 * @returns {boolean} - Whether the status allows actions
 */
export const isActiveStatus = (status) => {
  if (!status) return false;

  const statusKey = String(status).toLowerCase().trim();
  const activeStatuses = ['available', 'reserved', 'pending', 'financed', 'sold'];
  return activeStatuses.includes(statusKey);
};

/**
 * Get status priority for sorting (lower number = higher priority)
 * @param {string} status - The status key
 * @returns {number} - The priority number
 */
export const getStatusPriority = (status) => {
  if (!status) return 999;

  const statusKey = String(status).toLowerCase().trim();
  const config = STATUS_CONFIG[statusKey];
  return config ? config.priority : 999;
};