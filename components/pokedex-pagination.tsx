"use client";

import { Pagination } from "@heroui/react";
import { useRouter } from "next/navigation";

const WINDOW = 2;

export function PokedexPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (candidate) =>
      candidate === 1 ||
      candidate === totalPages ||
      Math.abs(candidate - page) <= WINDOW,
  );

  function go(target: number) {
    router.push(`/pokemon?page=${target}`);
  }

  return (
    <Pagination className="justify-center">
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={page === 1} onPress={() => go(page - 1)}>
            <Pagination.PreviousIcon />
            <span>Anterior</span>
          </Pagination.Previous>
        </Pagination.Item>

        {pages.map((candidate, index) => (
          <Pagination.Item key={candidate}>
            {index > 0 && candidate - pages[index - 1] > 1 ? (
              <Pagination.Ellipsis />
            ) : (
              <Pagination.Link isActive={candidate === page} onPress={() => go(candidate)}>
                {candidate}
              </Pagination.Link>
            )}
          </Pagination.Item>
        ))}

        <Pagination.Item>
          <Pagination.Next isDisabled={page === totalPages} onPress={() => go(page + 1)}>
            <span>Siguiente</span>
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
