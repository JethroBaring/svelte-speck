export const getTypeBadge = (type: string) => {
  const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
  if (type === 'global') return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
  if (type === 'test') return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
  return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
};

export const getStatusColor = (status: string) => {
  if (status === 'online') return 'bg-green-500';
  if (status === 'away') return 'bg-yellow-500';
  return 'bg-gray-400';
};

export const getPermissionBadge = (permission: string) => {
  const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
  if (permission === 'admin') return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
  if (permission === 'editor') return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
  return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
};