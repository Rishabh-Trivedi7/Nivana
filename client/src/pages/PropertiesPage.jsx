import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProperties } from '../services/propertyService.js';
import useDebounce from '../hooks/useDebounce.js';
import PropertyFilters from '../components/property/PropertyFilters.jsx';
import PropertyCard from '../components/property/PropertyCard.jsx';
import Pagination from '../components/common/Pagination.jsx';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import './PropertiesPage.css';

const DEFAULT_FILTERS = {
  search: '',
  state: '',
  category: '',
  sort: 'newest',
  featured: '',
  page: '1',
};

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = {
    search: searchParams.get('search') || '',
    state: searchParams.get('state') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    featured: searchParams.get('featured') || '',
    page: searchParams.get('page') || '1',
  };

  const debouncedSearch = useDebounce(filters.search);

  const updateFilters = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const current = {
          search: prev.get('search') || '',
          state: prev.get('state') || '',
          category: prev.get('category') || '',
          sort: prev.get('sort') || 'newest',
          featured: prev.get('featured') || '',
          page: prev.get('page') || '1',
        };
        const next = { ...current, ...updates };
        const params = new URLSearchParams();

        Object.entries(next).forEach(([key, value]) => {
          if (value && value !== DEFAULT_FILTERS[key]) {
            params.set(key, value);
          }
        });

        return params;
      });
    },
    [setSearchParams]
  );

  const resetFilters = () => setSearchParams({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          page: filters.page,
          limit: 12,
          sort: filters.sort,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (filters.state) params.state = filters.state;
        if (filters.category) params.category = filters.category;
        if (filters.featured === 'true') params.featured = true;

        const res = await getProperties(params);
        setProperties(res.data.properties);
        setPagination(res.data.pagination);
      } catch {
        setError('Unable to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearch, filters.state, filters.category, filters.sort, filters.featured, filters.page]);

  return (
    <div className="properties-page">
      <div className="properties-page__hero">
        <div className="container">
          <span className="section-label">Explore</span>
          <h1 className="properties-page__title">Curated Stays</h1>
          <p className="properties-page__subtitle">
            {pagination.total > 0
              ? `${pagination.total} handpicked propert${pagination.total === 1 ? 'y' : 'ies'} across India`
              : 'Discover wellness retreats, mountain lodges, and heritage escapes'}
          </p>
        </div>
      </div>

      <div className="container properties-page__layout">
        <PropertyFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
        />

        <div className="properties-page__results">
          <ErrorMessage message={error} />

          {loading ? (
            <Loader message="Finding stays..." />
          ) : properties.length === 0 ? (
            <div className="properties-page__empty">
              <h3>No stays found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="properties-page__grid">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPageChange={(p) => updateFilters({ page: String(p) })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
