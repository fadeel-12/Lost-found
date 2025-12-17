import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(list: T[], itemsPerPage = 6, resetDeps: any[] = []) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(list.length / itemsPerPage));

  const currentItems = useMemo(() => {
    const end = currentPage * itemsPerPage;
    const start = end - itemsPerPage;
    return list.slice(start, end);
  }, [list, currentPage, itemsPerPage]);

  useEffect(() => { setCurrentPage(1); }, resetDeps);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return { currentPage, setCurrentPage, totalPages, currentItems };
}
