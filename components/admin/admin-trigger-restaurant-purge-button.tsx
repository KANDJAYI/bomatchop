"use client";

import { useTransition } from "react";
import { adminTriggerRestaurantMidnightPurgeAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";

export function AdminTriggerRestaurantPurgeButton() {
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await adminTriggerRestaurantMidnightPurgeAction();
          if ("error" in result) {
            showToast(result.error, "error");
            return;
          }
          showToast(
            result.count === 0
              ? "Aucune offre restaurant à purger."
              : `${result.count} offre(s) restaurant purgée(s).`,
            "success",
          );
        });
      }}
    >
      {pending ? "Purge en cours…" : "Lancer la purge des plats restaurant"}
    </Button>
  );
}
