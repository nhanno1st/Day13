import type { ReactNode } from 'react';
import { useAuthStore } from '../store/useAuthStore';

interface ButtonWithRoleProps {
  allowedRoles: string[];
  children: ReactNode;
}

export const ButtonWithRole = ({ allowedRoles, children }: ButtonWithRoleProps) => {
  const loggedInUser = useAuthStore((state) => state.loggedInUser);

  if (!loggedInUser) return null;

  const hasRole = loggedInUser.roles?.some((role) =>
    allowedRoles.includes(role.name)
  );

  if (!hasRole) return null;

  return <>{children}</>;
};
