"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAccount, upsertAccount } from "@/lib/account/actions";
import type { Account } from "@/model/account/account";
import type { User } from "@supabase/supabase-js";

interface AccountContextValue {
  account: Account | null;
  user: User | null;
  loading: boolean;
}

const AccountContext = createContext<AccountContextValue>({
  account: null,
  user: null,
  loading: true,
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        getAccount(data.user.id).then((acc) => {
          setAccount(acc);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        if (event === "SIGNED_IN") {
          const acc = await upsertAccount();
          setAccount(acc);
        } else {
          const acc = await getAccount(currentUser.id);
          setAccount(acc);
        }
      } else {
        setAccount(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AccountContext.Provider value={{ account, user, loading }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
