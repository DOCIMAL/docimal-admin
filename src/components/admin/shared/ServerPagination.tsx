import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ServerPaginationProps = {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  itemLabel: string
  isLoading?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function ServerPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  itemLabel,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}: ServerPaginationProps) {
  if (totalItems <= 0) {
    return null
  }

  const clampedTotalPages = Math.max(totalPages, 1)
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), clampedTotalPages)
  const pageNumbers = getPageNumbers(safeCurrentPage, clampedTotalPages)
  const start = (safeCurrentPage - 1) * pageSize + 1
  const end = Math.min(safeCurrentPage * pageSize, totalItems)

  return (
    <div className='flex items-center justify-between overflow-clip px-2'>
      <div className='text-xs text-muted-foreground'>
        Showing <span className='text-foreground font-medium'>{start}</span> to{' '}
        <span className='text-foreground font-medium'>{end}</span> of{' '}
        <span className='text-foreground font-medium'>{totalItems.toLocaleString()}</span> {itemLabel}
      </div>

      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex items-center gap-2'>
          <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={isLoading}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage <= 1 || isLoading}
          >
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1 || isLoading}
          >
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>

          {pageNumbers.map((pageNumber, index) => (
            <div key={`${pageNumber}-${index}`} className='flex items-center'>
              {pageNumber === '...' ? (
                <span className='px-1 text-sm text-muted-foreground'>...</span>
              ) : (
                <Button
                  variant={safeCurrentPage === pageNumber ? 'default' : 'outline'}
                  className='h-8 min-w-8 px-2'
                  onClick={() => onPageChange(pageNumber as number)}
                  disabled={isLoading}
                >
                  {pageNumber}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage >= clampedTotalPages || isLoading}
          >
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='size-8 p-0'
            onClick={() => onPageChange(clampedTotalPages)}
            disabled={safeCurrentPage >= clampedTotalPages || isLoading}
          >
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
