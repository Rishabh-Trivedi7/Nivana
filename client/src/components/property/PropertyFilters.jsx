import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import Button from '../common/Button.jsx';
import { CATEGORIES } from '../../constants/categories.js';
import { INDIAN_STATES } from '../../constants/destinations.js';
import './PropertyFilters.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
];

export default function PropertyFilters({ filters, onChange, onReset }) {
  const handleChange = (e) => {
    onChange({ [e.target.name]: e.target.value, page: '1' });
  };

  return (
    <aside className="property-filters">
      <div className="property-filters__header">
        <h2 className="property-filters__title">Filters</h2>
        <Button variant="ghost" size="sm" type="button" onClick={onReset}>
          Clear all
        </Button>
      </div>

      <Input
        label="Search"
        name="search"
        value={filters.search}
        onChange={handleChange}
        placeholder="Search stays, locations..."
      />

      <Select
        label="State"
        name="state"
        value={filters.state}
        onChange={handleChange}
        placeholder="All states"
        options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
      />

      <Select
        label="Category"
        name="category"
        value={filters.category}
        onChange={handleChange}
        placeholder="All categories"
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
      />

      <Select
        label="Sort by"
        name="sort"
        value={filters.sort}
        onChange={handleChange}
        placeholder="Sort by"
        options={SORT_OPTIONS}
      />
    </aside>
  );
}
