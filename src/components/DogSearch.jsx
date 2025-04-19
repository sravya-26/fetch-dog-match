  import React, { useEffect, useState, useRef } from 'react';
  import axios from 'axios';
  import { useNavigate, useLocation } from 'react-router-dom';
  import confetti from 'canvas-confetti';
  import './DogSearch.css';

  function DogSearch({ onLogout }) {
    const [dogs, setDogs] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [locationMap, setLocationMap] = useState({});
    const [toastName, setToastName] = useState('');
    const [selectedBreed, setSelectedBreed] = useState('');
    const [zipFilter, setZipFilter] = useState('');
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');
    const [favorites, setFavorites] = useState([]);
    const [matchedDog, setMatchedDog] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [showFavorites, setShowFavorites] = useState(false);
    const [zipError, setZipError] = useState('');
    const [flippedCards, setFlippedCards] = useState({});
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [zipHistory, setZipHistory] = useState([]);
    const [ageMinHistory, setAgeMinHistory] = useState([]);
    const [ageMaxHistory, setAgeMaxHistory] = useState([]);
    const favoritesRef = useRef(null);
    const matchRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const size = 12;
    
    
    // Fetch breeds and set user name on first load
    useEffect(() => {
      fetchBreeds();

      const storedName = localStorage.getItem('userName');
      if (location.state?.userName) {
        setToastName(location.state.userName);
      } else if (storedName) {
        setToastName(storedName);
      }
    }, []);

    // Fetch dogs on initial mount and when page/sortOrder changes
    useEffect(() => {
      fetchDogs(page);

      // Re-fetch matched dog's location if not already available
      if (matchedDog && matchedDog.zip_code && !locationMap[matchedDog.zip_code]) {
        fetchMatchedDogLocation(matchedDog.zip_code);
      }
    }, [page, sortOrder]);

    // When breed is changed, reset to page 0 and fetch immediately
    useEffect(() => {
      setPage(0);
      fetchDogs(0);
    }, [selectedBreed]);

    useEffect(() => {
      if (dogs.length > 0) fetchLocationData();
    }, [dogs]);

    useEffect(() => {
      if (favorites.length === 0) setMatchedDog(null);
    }, [favorites]);

    useEffect(() => {
      const handleClickOutside = (e) => {
        // Close favorites if clicking outside its container
        if (showFavorites && favoritesRef.current && !favoritesRef.current.contains(e.target)) {
          setShowFavorites(false);
        }
    
        // Close search history if clicking outside the filters section
        if (!e.target.closest('.filters')) {
          setShowHistory(false);
        }
      };
    
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFavorites]);    


    useEffect(() => {
      setFlippedCards({});
    }, [page, selectedBreed, zipFilter, ageMin, ageMax]);


    useEffect(() => {
      const fetchMatchLocation = async () => {
        if (matchedDog && matchedDog.zip_code && !locationMap[matchedDog.zip_code]) {
          try {
            const res = await axios.post(
              'https://frontend-take-home-service.fetch.com/locations',
              [matchedDog.zip_code],
              { withCredentials: true }
            );
    
            if (Array.isArray(res.data) && res.data.length > 0) {
              setLocationMap(prev => ({
                ...prev,
                [matchedDog.zip_code]: res.data[0]
              }));
            }
          } catch (err) {
            console.error('Failed to fetch matched dog location:', err);
          }
        }
      };
    
      fetchMatchLocation();
    }, [matchedDog, locationMap]);    
    

    const playBark = () => {
      const audio = new Audio('/bark.mp3');
      audio.play();
    };
    
    const handleLogout = async () => {
      try {
        await axios.post('https://frontend-take-home-service.fetch.com/auth/logout', {}, {
          withCredentials: true
        });
        localStorage.removeItem('userName'); //  Clear name
        onLogout?.();
        navigate('/');
      } catch {
        alert('Logout failed.');
      }
    };    

    const fetchBreeds = async () => {
      try {
        const res = await axios.get('https://frontend-take-home-service.fetch.com/dogs/breeds', { withCredentials: true });
        if (!Array.isArray(res.data)) {
          console.error("Invalid response for breeds:", res.data);
          setBreeds([]);
          return;
        }
        setBreeds(res.data);
      } catch (err) {
        console.error("🐾 Failed to fetch breeds:", err);
        alert('Failed to fetch breeds. Please try again later.');
      }
    };
    

    const fetchDogs = async (customPage = page) => {
      if (zipFilter && !/^\d{5}$/.test(zipFilter)) {
        setZipError('Please enter a valid 5-digit ZIP code.');
        setDogs([]);
        return;
      }
      if (ageMin && ageMax && +ageMin > +ageMax) {
        setZipError('Min age cannot be greater than max age.');
        setDogs([]);
        return;
      }
      setZipError('');

      try {
        let query = `?sort=breed:${sortOrder}&from=${customPage * size}&size=${size}`;
        if (selectedBreed) query += `&breeds=${selectedBreed}`;
        if (zipFilter) query += `&zipCodes=${zipFilter.trim()}`;
        if (ageMin) query += `&ageMin=${ageMin}`;
        if (ageMax) query += `&ageMax=${ageMax}`;
      
        const { data } = await axios.get(`https://frontend-take-home-service.fetch.com/dogs/search${query}`, { withCredentials: true });
      
        if (!data || !Array.isArray(data.resultIds) || typeof data.total !== 'number') {
          console.error("Invalid response from /dogs/search", data);
          setDogs([]);
          setTotal(0);
          return;
        }
      
        setTotal(data.total);
      
        const dogDetails = await axios.post('https://frontend-take-home-service.fetch.com/dogs', data.resultIds, { withCredentials: true });
      
        if (!Array.isArray(dogDetails.data)) {
          console.error("Invalid dog details array", dogDetails);
          setDogs([]);
          return;
        }
      
        setDogs(dogDetails.data);
      
        if (dogDetails.data.length === 0) {
          setZipError('No dogs found for the given filters.');
        }
      
      } catch (err) {
        console.error("Failed to fetch dogs:", err);
        alert('Failed to fetch dogs. Please try again later.');
      }    
    };

    const handleSearchSubmit = () => {
      setPage(0);
      fetchDogs(0); //To always fetch for page 0 when submitting filters
    
      if (zipFilter && !/^\d{5}$/.test(zipFilter)) {
        setZipError('Please enter a valid 5-digit ZIP code.');
        setDogs([]);
        setTotal(0);
        return;
      }
    
      if (ageMin && ageMax && +ageMin > +ageMax) {
        setZipError('Min age cannot be greater than Max age.');
        setDogs([]);
        setTotal(0);
        return;
      }
    
      setZipError('');

      // Add Search to History
      if (zipFilter && !zipHistory.includes(zipFilter)) {
        setZipHistory((prev) => [zipFilter, ...prev.slice(0, 4)]);
      }
      if (ageMin && !ageMinHistory.includes(ageMin)) {
        setAgeMinHistory((prev) => [ageMin, ...prev.slice(0, 4)]);
      }
      if (ageMax && !ageMaxHistory.includes(ageMax)) {
        setAgeMaxHistory((prev) => [ageMax, ...prev.slice(0, 4)]);
      }

      fetchDogs();
      
    };
    
    const fetchLocationData = async () => {
      const zipCodes = [...new Set(dogs.map(dog => dog.zip_code))];
      if (!zipCodes.length) return;
    
      try {
        const res = await axios.post('https://frontend-take-home-service.fetch.com/locations', zipCodes, { withCredentials: true });
    
        if (!Array.isArray(res.data)) {
          console.error('Invalid response from /locations:', res.data);
          return;
        }
    
        const map = {};
        res.data.forEach(loc => {
          if (loc.zip_code) {
            map[loc.zip_code] = loc;
          }
        });
    
        setLocationMap(map);
      } catch (err) {
        console.error('Failed to fetch location data:', err);
      }
    };
    

    const handleMatch = async () => {
      if (!favorites.length) {
        alert('Please add at least one dog to favorites!');
        return;
      }
    
      try {
        const dogIds = favorites.map(dog => dog.id);
        const { data } = await axios.post('https://frontend-take-home-service.fetch.com/dogs/match', dogIds, { withCredentials: true });
    
        if (!data || !data.match) {
          console.error("Invalid response from /dogs/match:", data);
          alert('Failed to find a match. Please try again later.');
          return;
        }
    
        const dogRes = await axios.post('https://frontend-take-home-service.fetch.com/dogs', [data.match], { withCredentials: true });
    
        if (!Array.isArray(dogRes.data) || dogRes.data.length === 0) {
          console.error("Invalid matched dog data:", dogRes.data);
          alert('Failed to load matched dog. Try again.');
          return;
        }
    
        const dog = dogRes.data[0];
        setMatchedDog(dog);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
    
        // Fetch location for matched dog
        const locRes = await axios.post('https://frontend-take-home-service.fetch.com/locations', [dog.zip_code], { withCredentials: true });
    
        if (Array.isArray(locRes.data) && locRes.data.length > 0) {
          setLocationMap(prev => ({
            ...prev,
            [dog.zip_code]: locRes.data[0]
          }));
        }
    
        setTimeout(() => matchRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
      } catch (err) {
        console.error("🎯 Match error:", err);
        alert('Failed to generate match. Try again later.');
      }
    };
    
    
    const fetchMatchedDogLocation = async (zip) => {
      try {
        const res = await axios.post('https://frontend-take-home-service.fetch.com/locations', [zip], {
          withCredentials: true
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          setLocationMap(prev => ({
            ...prev,
            [zip]: res.data[0]
          }));
        }
      } catch (err) {
        console.error('Failed to fetch matched dog location:', err);
      }
    };    

    const toggleFlip = (id) => {
      setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));

      const viewedDog = dogs.find(d => d.id === id);
      if (!viewedDog) return;

      setRecentlyViewed(prev => {
        const existing = prev.filter(d => d.id !== viewedDog.id);
        return [viewedDog, ...existing].slice(0, 10); // Max 10 recent
      });
    };

    const renderPagination = () => {
      const totalPages = Math.ceil(total / size);
      if (totalPages <= 1|| total === 0) return null; //To hide pagination when there's nothing to paginate
    
      const currentPage = page + 1; // display is 1-indexed
      const pageNumbers = [];
    
      // Always show first page
      pageNumbers.push(1);
    
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
    
      // Determine range of pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
    
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }
    
      // Add ellipsis if needed after the range
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }
    
      // Always show last page if it's not already included
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    
      return (
        <div className="pagination-container">
          <button
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
            className="pagination-button"
          >
            ◀ Prev
          </button>
    
          {pageNumbers.map((num, index) =>
            num === '...' ? (
              <span key={`dots-${index}`} className="pagination-dots">...</span>
            ) : (
              <button
                key={`page-${num}`}
                onClick={() => setPage(num - 1)}
                className={page === num - 1 ? 'active-page' : 'pagination-button'}
              >
                {num}
              </button>
            )
          )}
    
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={page + 1 >= totalPages}
            className="pagination-button"
          >
            Next ▶
          </button>
        </div>
      );
    };  
    

    const pageButtonStyle = (btnPage, currentPage = page) => ({
      backgroundColor: btnPage === currentPage ? '#8E4585' : '#f0f0f0',
      color: btnPage === currentPage ? '#fff' : '#000',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 12px',
      cursor: 'pointer',
      fontWeight: btnPage === currentPage ? 'bold' : 'normal'
    });

    const navBtnStyle = (color, disabled) => ({
      backgroundColor: color,
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 12px',
      cursor: disabled ? 'not-allowed' : 'pointer'
    });

    const fullWidthButtonStyle = {
      width: 'calc(100% - 40px)',
      marginLeft: '10px',
      marginTop: '10px',
      padding: '8px',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    };

    return (
      <>
      
      <nav className="navbar">
        <div style={{ fontWeight: 'bold', fontSize: '24px' }}>🦴 FetchAFriend</div>

        {toastName && (
          <div className="welcome-message">
            👋 Welcome, {toastName}!
          </div>
        )}

        <div className="nav-buttons">
          <button onClick={() => setShowFavorites(!showFavorites)}>
            ❤️ Favorites ({favorites.length})
          </button>
          <button onClick={handleLogout}>⏻ Logout</button>
        </div>
      </nav>



        {showFavorites && (
    <div
      ref={favoritesRef}
      className="favorites-dropdown"
      style={{
        transition: 'all 0.3s ease',
        position: 'absolute',
        top: '70px',
        right: '110px',
        width: '250px',
        maxHeight: '300px',
        overflowY: 'auto',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        padding: '10px'
      }}
    >
      <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>❤️ Favorites</h4>
      {favorites.length === 0 ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic' }}>No favorites yet</p>
      ) : (
        <>
          {favorites.map(dog => (
            <div
              key={dog.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
                borderBottom: '1px solid #eee',
                paddingBottom: '5px',
                position: 'relative'
              }}
            >
              <img
                src={dog.img}
                alt={dog.name}
                width="40"
                height="40"
                style={{ borderRadius: '5px', objectFit: 'cover' }}
              />
              <div style={{ flexGrow: 1 }}>
                <strong>{dog.name}</strong>
                <p style={{ fontSize: '12px', margin: 0 }}>{dog.breed}</p>
              </div>
              <button
                onClick={() => {
                  const confirmRemove = window.confirm(`Are you sure you want to remove ${dog.name} from favorites?`);
                  if (confirmRemove) {
                    setFavorites(favorites.filter(fav => fav.id !== dog.id));
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '14px',
                  color: '#cc0000',
                  cursor: 'pointer'
                }}
              >
                ❌
              </button>
            </div>
          ))}

          <button
            style={{ ...fullWidthButtonStyle, backgroundColor: '#cc0000' }}
            onClick={() => {
              const confirmClear = window.confirm('Are you sure you want to remove all favorites?');
              if (confirmClear) setFavorites([]);
            }}
          >
            🗑️ Clear All
          </button>


          <button
            style={{ ...fullWidthButtonStyle, backgroundColor: '#8E4585' }}
            onClick={handleMatch}
          >
            🎯 Find Match
          </button>

        </>
        )}
      </div>
    )}

        <div className="filters" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <select
            onChange={(e) => setSelectedBreed(e.target.value)}
            value={selectedBreed}
            style={{
              maxWidth: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <option value="">All Breeds</option>
            {breeds.map((breed) => (
              <option key={breed} value={breed}>{breed}</option>
            ))}
          </select>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <input
              type="text"
              placeholder="Filter by ZIP code"
              value={zipFilter}
              onChange={(e) => setZipFilter(e.target.value)}
              onMouseEnter={() => setShowHistory('zip')}
              onMouseLeave={() => setShowHistory(null)}
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '6px', border: '1px solid #ccc', width: '130px' }}
            />
              {showHistory === 'zip' && zipHistory.length > 0 && (
              <InputHistoryDropdown
              items={zipHistory}
              onSelect={(val) => setZipFilter(val)}
            />
            )}
          </div>

          <div style={{ position: 'relative', display: 'inline-block', marginLeft: '10px' }}>
            <input
              type="number"
              placeholder="Min Age"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              onMouseEnter={() => setShowHistory('min')} 
              onMouseLeave={() => setShowHistory(null)}              
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '6px', border: '1px solid #ccc', width: '80px' }}
            />
            {showHistory === 'min' && ageMinHistory.length > 0 && (
            <InputHistoryDropdown
            items={ageMinHistory}
            onSelect={(val) => setAgeMin(val)}
            width="60px"
            />
          )}
          </div>

          <div style={{ position: 'relative', display: 'inline-block', marginLeft: '10px' }}>
            <input
              type="number"
              placeholder="Max Age"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              onMouseEnter={() => setShowHistory('max')}
              onMouseLeave={() => setShowHistory(null)}
              style={{ marginLeft: '10px', padding: '5px', borderRadius: '6px', border: '1px solid #ccc', width: '80px' }}
            />
            {showHistory === 'max' && ageMaxHistory.length > 0 && (
            <InputHistoryDropdown
              items={ageMaxHistory}
              onSelect={(val) => setAgeMax(val)}
              width="60px"
            />
            )}
          </div>


          <button onClick={handleSearchSubmit} style={{ backgroundColor: '#ff6b00', color: '#fff' }}>
            🔍 Submit
          </button>

          <button
            onClick={() => {
              setSelectedBreed('');
              setZipFilter('');
              setAgeMin('');
              setAgeMax('');
              setPage(0);
              setZipError('');
            }}
            style={{
              marginLeft: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ♻️ Clear Filters
          </button>

          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} style={{ marginLeft: '10px', backgroundColor: '#8E4585', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
            Sort: {sortOrder === 'asc' ? 'DESC' : 'ASC'}
          </button>
          {zipError && (
            <div style={{ color: 'red', marginTop: '8px', fontSize: '14px' }}>{zipError}</div>
          )}
        </div>


        <div className="dog-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', justifyContent: 'center', padding: '0 20px' }}>
          {dogs.map(dog => (
            <div key={dog.id} className={`dog-card flip-card ${flippedCards[dog.id] ? 'flipped' : ''}`}>
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <img src={dog.img} alt={dog.name} className="dog-image" style={{ width: '100%', height: '180px', objectFit: 'cover', margin: '0 auto', display: 'block', borderRadius: '8px' }} />
                  <p><strong>Breed:</strong> {dog.breed}</p>
                  <button onClick={() => toggleFlip(dog.id)}style={{ backgroundColor: '#8E4585', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                  >More Details</button>
                </div>
                <div
                  className="flip-card-back"
                  style={{
                    border: '2px solid #ccc',
                    borderRadius: '10px',
                    padding: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#fff'
                  }}
                >

                  <h3>{dog.name}</h3>
                  <p><strong>Age:</strong> {dog.age}</p>
                  <p><strong>ZIP:</strong> {dog.zip_code}</p>
                  <p><strong>Location:</strong> {locationMap[dog.zip_code] ? `${locationMap[dog.zip_code].city}, ${locationMap[dog.zip_code].state}` : 'Loading...'}</p>
                  {favorites.some(fav => fav.id === dog.id) ? (
                    <button disabled>✅ Favorited</button>
                  ) : (
                    <button
                    onClick={() => {
                      playBark(); // Play sound
                      setFavorites([...favorites, dog]); // Add to favorites
                    }}
                    style={{
                      backgroundColor: '#001F54',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    ❤️ Add to Favorites
                  </button>
                  
                  )}
                  <button
                    onClick={() => toggleFlip(dog.id)}
                    style={{
                      marginTop: '5px',
                      backgroundColor: '#001F54',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Back
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>

        {renderPagination()}

        {/* Recently viewedDog */}
        {recentlyViewed.length > 0 && (
          <div className="recently-viewed" style={{ marginTop: '40px', padding: '0 20px' }}>
            <h4 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '10px' }}>📆 Recently Viewed</h4>
            <div style={{
              display: 'flex',
              gap: '15px',
              overflowX: 'auto',
              paddingBottom: '10px'
            }}>
              {recentlyViewed.map(dog => (
                <div
                  key={dog.id}
                  className="dog-card"
                  style={{
                    minWidth: '200px',
                    flex: '0 0 auto'
                  }}
                >
                  <img src={dog.img} alt={dog.name} className="dog-image" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  <p>{dog.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}


        {matchedDog && (
        <div ref={matchRef} style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3 style={{ fontSize: '22px', marginBottom: '15px', color: '#e63946' }}>🎯 Your Perfect Match</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="dog-card match-card">
              <img
                src={matchedDog.img}
                alt={matchedDog.name}
                className="dog-image"
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}
              />
              <h3>{matchedDog.name}</h3>
              <p><strong>Breed:</strong> {matchedDog.breed}</p>
              <p><strong>Age:</strong> {matchedDog.age}</p>
              <p><strong>ZIP:</strong> {matchedDog.zip_code}</p>
              <p>
                <strong>Location:</strong>{' '}
                {locationMap[matchedDog.zip_code]
                  ? `${locationMap[matchedDog.zip_code].city}, ${locationMap[matchedDog.zip_code].state}`
                  : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      )}


      </>
    );
  }

  const InputHistoryDropdown = ({ items, onSelect, width = '130px' }) => {
    if (items.length === 0) return null;
  
    return (
      <div
        className="history-dropdown"
        style={{
          position: 'absolute',
          top: '38px',
          left: '10px',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          zIndex: 999,
          maxHeight: '150px',
          overflowY: 'auto',
          width: width,
          fontSize: '14px'
        }}
      >
        {items.map((value, idx) => (
          <div
            key={idx}
            className="history-item"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '5px 8px',
              borderBottom: '1px solid #eee',
              cursor: 'pointer'
            }}
          >
            {value}
          </div>
        ))}
      </div>
    );
  };
  
  export default DogSearch;
