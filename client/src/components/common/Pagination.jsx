import Button from './Button.jsx';
import './Pagination.css';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPages = () => {
    const items = [];
    const delta = 1;
    const left = Math.max(2, page - delta);
    const right = Math.min(pages - 1, page + delta);

    items.push(1);
    if (left > 2) items.push('...');
    for (let i = left; i <= right; i += 1) items.push(i);
    if (right < pages - 1) items.push('...');
    if (pages > 1) items.push(pages);

    return items;
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>

      <div className="pagination__pages">
        {getPages().map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="pagination__ellipsis">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination__page ${p === page ? 'pagination__page--active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
