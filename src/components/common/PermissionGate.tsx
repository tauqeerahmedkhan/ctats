import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { UserPermissions } from '../../types/User';

interface PermissionGateProps {
  permission: keyof UserPermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

interface MultiplePermissionGateProps {
  permissions: (keyof UserPermissions)[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission } = useDatabase();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export const MultiplePermissionGate: React.FC<MultiplePermissionGateProps> = ({
  permissions,
  children,
  fallback = null,
  requireAll = false,
}) => {
  const { hasPermission } = useDatabase();

  const hasAccess = requireAll
    ? permissions.every(permission => hasPermission(permission))
    : permissions.some(permission => hasPermission(permission));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};