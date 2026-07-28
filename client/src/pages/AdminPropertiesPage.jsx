import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getProperties } from '../services/propertyService.js';
import {
  createProperty,
  updateProperty,
  deleteProperty,
  uploadImages,
} from '../services/adminService.js';
import { CATEGORIES } from '../constants/categories.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Select from '../components/common/Select.jsx';
import './AdminPropertiesPage.css';

const AMENITY_OPTIONS = [
  'Spa',
  'Yoga Pavilion',
  'Organic Dining',
  'Meditation Garden',
  'Pool',
  'Wellness Programs',
  'Forest Trails',
  'Library',
  'Mountain Views',
  'Guided Hikes',
  'Guided Treks',
  'Local Cuisine',
  'Fireplace',
  'Private Cottages',
  'Heated Floors',
  'Stargazing',
  'Riverside Dining',
  'Nature Walks',
  'Safari',
  'Pool Villa',
  'Marble Pool',
  'Cultural Tours',
  'Private Dining',
  'Tea Tasting',
  'River Cruise',
  'Colonial Bungalow',
  'Bird Watching',
  'Tea Tours',
  'Homestay',
  'Organic Farm',
  'Ayurveda',
  'Private Pool',
  'Beach Access',
  'Heritage Fort',
  'Rooftop Dining',
  'Cultural Programs',
  'Lake Views',
  'Boat Transfer',
  'Royal Suites',
  'Fine Dining',
  'Heritage Rooms',
  'Afternoon Tea',
  'Fireplace Lounge',
];

export default function AdminPropertiesPage() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Availability Modal States
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedPropertyForAvailability, setSelectedPropertyForAvailability] = useState(null);
  const [blockCheckIn, setBlockCheckIn] = useState('');
  const [blockCheckOut, setBlockCheckOut] = useState('');
  const [blockingLoading, setBlockingLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [featured, setFeatured] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const fetchPropertiesList = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Pass ownerId so the host only sees their own properties
      const res = await getProperties({ limit: 50, ownerId: user._id });
      setProperties(res.data.properties);
    } catch (err) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait until auth has fully resolved before fetching
    if (!authLoading) {
      fetchPropertiesList();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?._id]);

  const openAvailabilityModal = (prop) => {
    setSelectedPropertyForAvailability(prop);
    setBlockCheckIn('');
    setBlockCheckOut('');
    setAvailabilityError('');
    setIsAvailabilityModalOpen(true);
  };

  const closeAvailabilityModal = () => {
    setIsAvailabilityModalOpen(false);
    setSelectedPropertyForAvailability(null);
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    setAvailabilityError('');

    if (!blockCheckIn || !blockCheckOut) {
      setAvailabilityError('Please select start and end dates.');
      return;
    }

    if (blockCheckOut <= blockCheckIn) {
      setAvailabilityError('End date must be after start date.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(blockCheckIn) < today) {
      setAvailabilityError('Start date cannot be in the past.');
      return;
    }

    setBlockingLoading(true);
    try {
      const existingBlocks = selectedPropertyForAvailability.blockedDates || [];
      const updatedBlocks = [
        ...existingBlocks,
        { checkInDate: blockCheckIn, checkOutDate: blockCheckOut }
      ];

      const res = await updateProperty(selectedPropertyForAvailability._id, {
        blockedDates: updatedBlocks
      });

      const updatedProperty = res.data.property;
      setSelectedPropertyForAvailability(updatedProperty);
      setProperties(prev => prev.map(p => p._id === updatedProperty._id ? updatedProperty : p));
      setBlockCheckIn('');
      setBlockCheckOut('');
    } catch (err) {
      setAvailabilityError(err.message || 'Failed to block dates');
    } finally {
      setBlockingLoading(false);
    }
  };

  const handleRemoveBlock = async (blockId) => {
    if (!window.confirm('Are you sure you want to unblock these dates?')) {
      return;
    }

    setAvailabilityError('');
    setBlockingLoading(true);
    try {
      const updatedBlocks = (selectedPropertyForAvailability.blockedDates || []).filter(
        b => b._id !== blockId
      );

      const res = await updateProperty(selectedPropertyForAvailability._id, {
        blockedDates: updatedBlocks
      });

      const updatedProperty = res.data.property;
      setSelectedPropertyForAvailability(updatedProperty);
      setProperties(prev => prev.map(p => p._id === updatedProperty._id ? updatedProperty : p));
    } catch (err) {
      setAvailabilityError(err.message || 'Failed to unblock dates');
    } finally {
      setBlockingLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setLocation('');
    setState('');
    setCategory(CATEGORIES[0]);
    setDescription('');
    setPricePerNight('');
    setSelectedAmenities([]);
    setUploadedImages([]);
    setFeatured(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prop) => {
    setEditingId(prop._id);
    setTitle(prop.title);
    setLocation(prop.location);
    setState(prop.state);
    setCategory(prop.category);
    setDescription(prop.description);
    setPricePerNight(prop.pricePerNight);
    setSelectedAmenities(prop.amenities || []);
    setUploadedImages(prop.images || []);
    setFeatured(prop.featured || false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAmenityChange = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    setFormError('');
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await uploadImages(formData);
      setUploadedImages([...uploadedImages, ...res.data.images]);
    } catch (err) {
      setFormError(err.message || 'Failed to upload images');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (imgUrl) => {
    setUploadedImages(uploadedImages.filter((img) => img !== imgUrl));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (uploadedImages.length === 0) {
      setFormError('Please upload at least one image.');
      return;
    }

    const payload = {
      title,
      location,
      state,
      category,
      description,
      pricePerNight: Number(pricePerNight),
      amenities: selectedAmenities,
      images: uploadedImages,
      featured,
    };

    setFormLoading(true);
    try {
      if (editingId) {
        await updateProperty(editingId, payload);
      } else {
        await createProperty(payload);
      }
      setIsModalOpen(false);
      await fetchPropertiesList();
    } catch (err) {
      setFormError(err.message || 'Failed to save property details');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this property?')) {
      return;
    }
    try {
      await deleteProperty(id);
      await fetchPropertiesList();
    } catch (err) {
      alert(err.message || 'Failed to delete property');
    }
  };

  if (loading) {
    return <Loader message="Loading property catalogue..." />;
  }

  return (
    <div className="admin-properties">
      <div className="admin-properties__header">
        <h1 className="admin-properties__title">Manage Properties</h1>
        <Button onClick={openCreateModal}>+ Create Retreat</Button>
      </div>

      <ErrorMessage message={error} />

      <div className="properties-table-wrap">
        <table className="properties-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Location</th>
              <th>Category</th>
              <th>Price / Night</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop) => (
              <tr key={prop._id}>
                <td>
                  <img
                    src={prop.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                    alt={prop.title}
                    className="property-table-cell__img"
                  />
                </td>
                <td style={{ fontWeight: 500 }}>{prop.title}</td>
                <td>
                  {prop.location}, {prop.state}
                </td>
                <td>{prop.category}</td>
                <td>{formatCurrency(prop.pricePerNight)}</td>
                <td>
                  {prop.featured ? <span className="property-table-cell__featured">Yes</span> : 'No'}
                </td>
                <td>
                  <div className="property-table-actions">
                    <button
                      className="property-action-btn property-action-btn--edit"
                      onClick={() => openEditModal(prop)}
                    >
                      Edit
                    </button>
                    <button
                      className="property-action-btn property-action-btn--availability"
                      onClick={() => openAvailabilityModal(prop)}
                    >
                      Availability
                    </button>
                    <button
                      className="property-action-btn property-action-btn--delete"
                      onClick={() => handleDelete(prop._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <header className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Retreat Details' : 'Register New Retreat'}</h2>
              <button className="modal-close-btn" onClick={handleModalClose}>
                &times;
              </button>
            </header>

            {formError && <ErrorMessage message={formError} />}

            <form onSubmit={handleFormSubmit} className="admin-property-form">
              <Input
                label="Retreat Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="form-row">
                <Input
                  label="Location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <Input
                  label="State"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <Select
                  label="Retreat Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                />
                <Input
                  label="Price per Night (₹)"
                  type="number"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="form-label">Retreat Description</label>
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  required
                />
              </div>

              <div className="amenities-selector">
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                  Retreat Amenities
                </label>
                <div className="amenities-grid-form">
                  {AMENITY_OPTIONS.map((am) => (
                    <div key={am} className="form-group-checkbox">
                      <input
                        type="checkbox"
                        id={`amenity-${am}`}
                        checked={selectedAmenities.includes(am)}
                        onChange={() => handleAmenityChange(am)}
                      />
                      <label htmlFor={`amenity-${am}`}>{am}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="image-upload-box">
                <div>
                  <label className="form-label">Upload Stays Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                  />
                  {imageUploading && <p style={{ fontSize: '0.8rem', color: 'var(--color-forest)' }}>Uploading photos...</p>}
                </div>

                {uploadedImages.length > 0 && (
                  <div>
                    <label className="form-label">Photos Included</label>
                    <div className="image-previews-grid">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className="image-preview-thumbnail">
                          <img src={img} alt={`Preview ${i + 1}`} />
                          <button
                            type="button"
                            className="image-preview-delete"
                            onClick={() => handleRemoveImage(img)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <label htmlFor="featured">Highlight on Home Page (Featured Retreat)</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <Button variant="outline" type="button" onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button type="submit" loading={formLoading}>
                  {editingId ? 'Save Changes' : 'Register Retreat'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAvailabilityModalOpen && selectedPropertyForAvailability && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--availability" style={{ maxWidth: '550px' }}>
            <header className="modal-header">
              <h2 className="modal-title">Manage Availability</h2>
              <button className="modal-close-btn" onClick={closeAvailabilityModal}>
                &times;
              </button>
            </header>

            <div style={{ marginBottom: '1.5rem' }}>
              <span className="availability-retreat-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-sage)', fontWeight: '600' }}>Retreat</span>
              <h3 className="availability-retreat-title" style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.25rem', color: 'var(--color-forest)', margin: '0.2rem 0' }}>{selectedPropertyForAvailability.title}</h3>
              <p className="availability-retreat-location" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {selectedPropertyForAvailability.location}, {selectedPropertyForAvailability.state}
              </p>
            </div>

            {availabilityError && <ErrorMessage message={availabilityError} />}

            <form onSubmit={handleAddBlock} className="availability-block-form" style={{ background: 'var(--color-off-white)', border: '1px solid var(--color-border)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
              <h4 className="availability-section-title" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem', marginTop: 0 }}>Block Date Range</h4>
              <div className="availability-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Input
                  label="Start Date"
                  type="date"
                  value={blockCheckIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBlockCheckIn(e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={blockCheckOut}
                  min={blockCheckIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBlockCheckOut(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" loading={blockingLoading}>
                Block Dates
              </Button>
            </form>

            <div className="blocked-dates-section">
              <h4 className="availability-section-title" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem' }}>Blocked Periods</h4>
              {!selectedPropertyForAvailability.blockedDates ||
              selectedPropertyForAvailability.blockedDates.length === 0 ? (
                <p className="no-blocks-text" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No dates are currently manually blocked.</p>
              ) : (
                <div className="blocked-ranges-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {selectedPropertyForAvailability.blockedDates.map((block) => (
                    <div key={block._id} className="blocked-range-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-off-white)', border: '1px solid var(--color-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                      <span className="blocked-range-dates" style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: 500 }}>
                        📅 {new Date(block.checkInDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        –{' '}
                        {new Date(block.checkOutDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <button
                        type="button"
                        className="property-action-btn property-action-btn--delete"
                        style={{ padding: '0.25rem 0.50rem', fontSize: '0.75rem' }}
                        onClick={() => handleRemoveBlock(block._id)}
                        disabled={blockingLoading}
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
