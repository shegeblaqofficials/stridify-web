"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getAccount,
  getOrganization,
  upsertAccount,
} from "@/lib/account/actions";
import type { Account } from "@/model/account/account";
import type { User } from "@supabase/supabase-js";
import { Organization } from "@/model/account/organization";

interface AccountContextValue {
  organization: Organization | null;
  account: Account | null;
  user: User | null;
  loading: boolean;
}

const AccountContext = createContext<AccountContextValue>({
  account: null,
  user: null,
  organization: null,
  loading: true,
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadAccount(u: User) {
      // Try fetching first; if missing, upsert to create the row
      let acc = await getAccount(u.id);
      if (!acc) acc = await upsertAccount();
      if (cancelled) return;
      setAccount(acc);
      if (acc) {
        const org = await getOrganization(acc.organization_id);
        if (!cancelled) setOrganization(org);
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUser(data.user);
      if (data.user) {
        loadAccount(data.user).finally(() => {
          if (!cancelled) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadAccount(currentUser);
      } else {
        setAccount(null);
        setOrganization(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AccountContext.Provider value={{ account, user, organization, loading }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
