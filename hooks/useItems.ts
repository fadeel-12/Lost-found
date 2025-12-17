import { useCallback, useEffect, useState } from "react";

export function useItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const reload = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error("Failed to load items:", e);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { items, loadingItems, reload };
}
