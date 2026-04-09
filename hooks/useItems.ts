import { useCallback, useEffect, useState } from "react";

export function useItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const reload = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load items:", e);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return { items, loadingItems, reload, removeItem };
}
