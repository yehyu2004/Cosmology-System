"use client";

import { createContext, useContext } from "react";

interface EffectiveRoleContextValue {
  userRole: string;
}

const EffectiveRoleContext = createContext<EffectiveRoleContextValue>({
  userRole: "STUDENT",
});

export function EffectiveRoleProvider({
  userRole,
  children,
}: {
  userRole: string;
  children: React.ReactNode;
}) {
  return (
    <EffectiveRoleContext.Provider value={{ userRole }}>
      {children}
    </EffectiveRoleContext.Provider>
  );
}

export function useEffectiveRole() {
  return useContext(EffectiveRoleContext).userRole;
}
