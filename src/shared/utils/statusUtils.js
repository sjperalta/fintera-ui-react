
import {
  faClock,
  faClipboardList,
  faCheckCircle,
  faTimesCircle,
  faLock,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { formatStatus } from "./formatStatus";

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
    priority: 4,
    theme: {
      bg: "bg-yellow-50 dark:bg-yellow-900/10",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-300 dark:border-yellow-500/40",
      icon: faClock,
      color: "#EAB308",
      shadow: "shadow-[0_0_15px_rgba(234,179,8,0.1)]"
    }
  },
  submitted: {
    label: 'Enviado',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    priority: 4,
    theme: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-300 dark:border-blue-500/40",
      icon: faClipboardList,
      color: "#3B82F6",
      shadow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]"
    }
  },
  approved: {
    label: 'Aprobado',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    priority: 5,
    theme: {
      bg: "bg-green-50 dark:bg-green-900/10",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-300 dark:border-green-500/40",
      icon: faCheckCircle,
      color: "#22C55E",
      shadow: "shadow-[0_0_15px_rgba(34,197,94,0.1)]"
    }
  },
  rejected: {
    label: 'Rechazado',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    priority: 6,
    theme: {
      bg: "bg-red-50 dark:bg-red-900/10",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-300 dark:border-red-500/40",
      icon: faTimesCircle,
      color: "#EF4444",
      shadow: "shadow-[0_0_15px_rgba(239,68,68,0.1)]"
    }
  },
  cancelled: {
    label: 'Cancelado',
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    priority: 7
  },
  closed: {
    label: 'Pagado',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    priority: 8,
    theme: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-300 dark:border-blue-500/40",
      icon: faLock,
      color: "#3B82F6",
      shadow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]"
    }
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

/**
 * Get rich status theme object for contracts cards
 * @param {string} status
 */
export const getStatusTheme = (status) => {
  const statusKey = String(status || "").toLowerCase().trim();
  const config = STATUS_CONFIG[statusKey];

  if (config && config.theme) {
    return config.theme;
  }

  // Default fallback
  return {
    bg: "bg-gray-50 dark:bg-gray-900/10",
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-800/30",
    icon: faInfoCircle,
    color: "#6B7280"
  };
};