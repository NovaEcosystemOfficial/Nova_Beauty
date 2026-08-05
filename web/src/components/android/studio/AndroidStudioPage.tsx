"use client";

import Link from "next/link";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AndroidTopBar } from "@/components/android/layout/AndroidTopBar";
import { IconBadge } from "@/components/ui/IconBadge";
import { useUnreadNotificationCount } from "@/components/notifications/NotificationBadge";
import { useAuth } from "@/contexts/AuthContext";
import { magazzinoHubSections } from "@/lib/constants/magazzino-hub";
import { studioHubActiveSections } from "@/lib/constants/studio-hub";
import { db } from "@/lib/firebase/client";
import { productsPath, suppliersPath } from "@/lib/firebase/paths";
import { isBelowMinimum } from "@/lib/utils/stock-status";
import type { MagazzinoProductDocument } from "@/types/firestore";

export function AndroidStudioPage() {
  const { user } = useAuth();
  const unreadCount = useUnreadNotificationCount();
  const [productCount, setProductCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [reorderCount, setReorderCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    const productsQuery = query(collection(db, productsPath(user.uid)), orderBy("name", "asc"));
    const suppliersQuery = query(collection(db, suppliersPath(user.uid)), orderBy("name", "asc"));

    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const products = snapshot.docs.map((docItem) => docItem.data() as MagazzinoProductDocument);
      setProductCount(products.length);
      setReorderCount(products.filter((product) => isBelowMinimum(product.quantity ?? 0, product.minimumQuantity ?? 0)).length);
      setLowStockCount(
        products.filter((product) => {
          const quantity = product.quantity ?? 0;
          const minimum = product.minimumQuantity ?? 0;
          return quantity > 0 && quantity <= minimum;
        }).length
      );
    });

    const unsubscribeSuppliers = onSnapshot(suppliersQuery, (snapshot) => {
      setSupplierCount(snapshot.size);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSuppliers();
    };
  }, [user]);

  const magazzinoSummary = [
    { label: "Prodotti", value: productCount },
    { label: "Scorte basse", value: lowStockCount },
    { label: "Da ordinare", value: reorderCount },
    { label: "Fornitori", value: supplierCount }
  ];

  return (
    <div className="space-y-4 pb-2">
      <AndroidTopBar title="Studio" subtitle="Centro di controllo mobile" />

      <section className="space-y-2">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-beauty-muted">Magazzino</h2>
        <div className="grid grid-cols-2 gap-2">
          {magazzinoSummary.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-beauty-border/60 bg-beauty-elevated/70 px-3 py-2.5"
            >
              <p className="text-[11px] text-beauty-muted">{item.label}</p>
              <p className="text-[18px] font-bold text-beauty-text">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-beauty-border/60 bg-beauty-elevated/70">
          {magazzinoHubSections.map((section, index) => (
            <Link
              key={section.id}
              href={section.href}
              className={`flex min-h-[54px] items-center gap-3 px-3 py-2.5 transition active:bg-beauty-primary/6 ${
                index > 0 ? "border-t border-beauty-border/50" : ""
              }`}
            >
              <IconBadge icon={section.icon} tone={section.tone} className="!size-9 !rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-beauty-text">{section.title}</span>
                <span className="block truncate text-[11px] text-beauty-muted">{section.description}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-beauty-subtle" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-beauty-muted">Strumenti</h2>
        <div className="overflow-hidden rounded-2xl border border-beauty-border/60 bg-beauty-elevated/70">
          {studioHubActiveSections.map((section, index) => (
            <Link
              key={section.id}
              href={section.href}
              className={`relative flex min-h-[54px] items-center gap-3 px-3 py-2.5 transition active:bg-beauty-primary/6 ${
                index > 0 ? "border-t border-beauty-border/50" : ""
              }`}
            >
              <IconBadge icon={section.icon} tone={section.tone} className="!size-9 !rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-beauty-text">{section.title}</span>
                <span className="block truncate text-[11px] text-beauty-muted">{section.description}</span>
              </span>
              {section.id === "notifiche" && unreadCount > 0 ? (
                <span className="mr-5 grid min-w-5 place-items-center rounded-full bg-beauty-danger px-1.5 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
              <ChevronRight className="size-4 shrink-0 text-beauty-subtle" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
