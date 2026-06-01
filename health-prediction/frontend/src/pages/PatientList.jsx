import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPatients, deletePatient } from '../services/api';
import PredictionBadge from '../components/PredictionBadge';
import { 
  Search, 
  Trash2, 
  Edit, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  User,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [ordering, setOrdering] = useState('-created_at'); // Default ordering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients(page, searchQuery, ordering);
      setPatients(data.results);
      setTotalCount(data.count);
      // Math.ceil(total_records / page_size). Django's page_size is 10.
      setTotalPages(Math.ceil(data.count / 10));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve patient logs. Please verify API connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, ordering]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchPatients();
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setPage(1);
    // Since state update is async, we call fetch with empty query directly
    setLoading(true);
    getPatients(1, '', ordering)
      .then((data) => {
        setPatients(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10));
      })
      .catch((err) => setError('Failed to retrieve patient logs.'))
      .finally(() => setLoading(false));
  };

  const handleOrderChange = (field) => {
    // If clicking same field, toggle direction. Else, set to descending.
    if (ordering === field) {
      setOrdering(`-${field}`);
    } else if (ordering === `-${field}`) {
      setOrdering(field);
    } else {
      setOrdering(field);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete patient logs for "${name}"? This action cannot be undone.`)) {
      try {
        setDeletingId(id);
        await deletePatient(id);
        
        // If we are on the last item of a page (except first page), go to previous page
        const isLastItemOnPage = patients.length === 1;
        const newPage = (isLastItemOnPage && page > 1) ? page - 1 : page;
        
        if (newPage !== page) {
          setPage(newPage);
        } else {
          // Re-fetch current page
          fetchPatients();
        }
      } catch (err) {
        console.error(err);
        alert('Failed to delete patient record.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getSortIcon = (field) => {
    if (ordering === field) {
      return <span className="text-primary font-bold">▲</span>;
    }
    if (ordering === `-${field}`) {
      return <span className="text-primary font-bold">▼</span>;
    }
    return <ArrowUpDown size={14} className="text-muted" />;
  };

  return (
    <div className="container main-content fade-in">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-dark mb-1">Patient Directory</h1>
          <p className="text-secondary mb-0">Manage diagnostics records, search, filter, and view predictions</p>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="d-flex gap-2 w-100 w-sm-auto">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 rounded-start-3 text-secondary">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 rounded-0"
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderLeft: 'none', borderRight: 'none', minWidth: '200px' }}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="btn btn-white border-start-0 border text-secondary" 
                onClick={handleSearchClear}
                style={{ borderLeft: 'none' }}
              >
                ✕
              </button>
            )}
            <button type="submit" className="btn btn-primary rounded-end-3 px-3">
              Search
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm rounded-3 d-flex align-items-center gap-3 mb-4" role="alert">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary">Retrieving directories...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 bg-white">
          <User className="mx-auto mb-3 text-muted" size={48} />
          <h4 className="fw-bold text-dark mb-1">No Records Found</h4>
          <p className="text-secondary px-3">
            {searchQuery ? `No matches found for "${searchQuery}"` : 'The database is currently empty.'}
          </p>
          {!searchQuery && (
            <Link to="/add" className="btn btn-primary btn-sm rounded-3 mt-3 btn-animate px-4 py-2">
              Register First Patient
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="table-responsive mb-4">
            <table className="table custom-table table-hover align-middle">
              <thead>
                <tr>
                  <th scope="col" style={{ cursor: 'pointer' }} onClick={() => handleOrderChange('full_name')}>
                    <div className="d-flex align-items-center gap-1.5">
                      Name {getSortIcon('full_name')}
                    </div>
                  </th>
                  <th scope="col" style={{ cursor: 'pointer' }} onClick={() => handleOrderChange('email')}>
                    <div className="d-flex align-items-center gap-1.5">
                      Email {getSortIcon('email')}
                    </div>
                  </th>
                  <th scope="col" style={{ cursor: 'pointer' }} onClick={() => handleOrderChange('glucose')}>
                    <div className="d-flex align-items-center gap-1.5">
                      Glucose {getSortIcon('glucose')}
                    </div>
                  </th>
                  <th scope="col" style={{ cursor: 'pointer' }} onClick={() => handleOrderChange('haemoglobin')}>
                    <div className="d-flex align-items-center gap-1.5">
                      Hb {getSortIcon('haemoglobin')}
                    </div>
                  </th>
                  <th scope="col" style={{ cursor: 'pointer' }} onClick={() => handleOrderChange('cholesterol')}>
                    <div className="d-flex align-items-center gap-1.5">
                      Cholesterol {getSortIcon('cholesterol')}
                    </div>
                  </th>
                  <th scope="col" style={{ cursor: 'pointer' }} onClick={() => handleOrderChange('prediction_result')}>
                    <div className="d-flex align-items-center gap-1.5">
                      Prediction {getSortIcon('prediction_result')}
                    </div>
                  </th>
                  <th scope="col" className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="fw-bold text-dark">{p.full_name}</span>
                    </td>
                    <td>
                      <span className="text-secondary">{p.email}</span>
                    </td>
                    <td>
                      <span className="fw-medium">{p.glucose} mg/dL</span>
                    </td>
                    <td>
                      <span className="fw-medium">{p.haemoglobin} g/dL</span>
                    </td>
                    <td>
                      <span className="fw-medium">{p.cholesterol} mg/dL</span>
                    </td>
                    <td>
                      <PredictionBadge result={p.prediction_result} />
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Link to={`/patients/${p.id}`} className="btn btn-light btn-sm text-primary rounded-3 border-0 btn-animate" title="View Detail">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/edit/${p.id}`} className="btn btn-light btn-sm text-warning rounded-3 border-0 btn-animate" title="Edit Patient">
                          <Edit size={16} />
                        </Link>
                        <button
                          className="btn btn-light btn-sm text-danger rounded-3 border-0 btn-danger-animate"
                          onClick={() => handleDelete(p.id, p.full_name)}
                          disabled={deletingId === p.id}
                          title="Delete Logs"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
              <span className="text-secondary fw-medium">
                Showing Page {page} of {totalPages} ({totalCount} total patient logs)
              </span>
              <nav aria-label="Patient directories pagination">
                <ul className="pagination mb-0">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link rounded-start-3 d-flex align-items-center gap-1 px-3 py-2" onClick={() => setPage(page - 1)}>
                      <ChevronLeft size={16} />
                      <span>Prev</span>
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                      <button className="page-link px-3 py-2" onClick={() => setPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link rounded-end-3 d-flex align-items-center gap-1 px-3 py-2" onClick={() => setPage(page + 1)}>
                      <span>Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientList;
