import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DonorMap = ({ city, organType, bloodGroup }) => {
  const [centerCoords, setCenterCoords] = useState(null);
  const [donors, setDonors] = useState([]);

  // Fix default marker icon (Leaflet)
  const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  });
  L.Marker.prototype.options.icon = DefaultIcon;

  // Fetch city coordinates on city change
  useEffect(() => {
    if (!city) {
      setCenterCoords(null);
      return;
    }
    const fetchCenter = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json`
        );
        const data = await response.json();
        if (data[0]) {
          setCenterCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (err) {
        console.error("Error fetching city coordinates:", err);
      }
    };
    fetchCenter();
  }, [city]);

  // Fetch nearby donors when filters change
  useEffect(() => {
    if (!centerCoords) return;
    const fetchDonors = async () => {
      try {
        const url = new URL("http://${process.env.REACT_APP_API_URL}/api/find-donors");
        url.searchParams.append("city", city);
        if (organType) url.searchParams.append("organ", organType);
        if (bloodGroup) url.searchParams.append("bloodType", bloodGroup);
        const res = await fetch(url);
        const data = await res.json();
        setDonors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching donors:", err);
      }
    };
    fetchDonors();
  }, [centerCoords, organType, bloodGroup, city]);

  // Wait for center coords before rendering the map
  if (!centerCoords) return <div>Loading map...</div>;

  // Custom component to recenter map on coord change
  function UpdateMapCenter({ coords }) {
    const map = useMap();
    useEffect(() => {
      if (coords) {
        map.flyTo(coords, map.getZoom());
      }
    }, [coords]);
    return null;
  }

  return (
    <div>
      <h3>Donor Map (within 300km of {city})</h3>
      <MapContainer center={centerCoords} zoom={7} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Circle of 300km radius */}
        <Circle
          center={centerCoords}
          radius={300000}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
        />
        {/* Hospital marker at center */}
        <Marker position={centerCoords}>
          <Popup>Hospital Location: {city}</Popup>
        </Marker>
        {/* Markers for each nearby donor */}
        {donors.map((donor, index) => (
          <Marker key={index} position={[donor.lat, donor.lng]}>
            <Popup>{donor.name} ({donor.location})</Popup>
          </Marker>
        ))}
        {/* Re-center the map when centerCoords changes (React-Leaflet MapContainer is immutable) */}
        <UpdateMapCenter coords={centerCoords} />
      </MapContainer>
    </div>
  );
};

export default DonorMap;