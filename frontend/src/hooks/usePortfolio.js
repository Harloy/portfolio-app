import { useQuery } from '@tanstack/react-query'

export function usePortfolio(id) {
  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => fetch(`/api/portfolio/${id}`).then(r => r.json()),
  })
}
