import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'; // Include useMapEvents here
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import policestationmarker from '../static/images/policestationmarker.png';
import activemarker from '../static/images/activecctvmarker3.png';
import inactivemarker from '../static/images/inactivecctvmarker3.png';
import "../static/mapscomponent.css";

// Component to track map bounds and trigger events
function MapEvents({ onBoundsChange }) {
  useMapEvents({
    moveend() {
      const map = this;
      const bounds = map.getBounds();
      onBoundsChange(bounds);
    },
  });
  return null;
}

// Function to filter data by bounds
function filterDataByBounds(data, bounds) {
  return data.filter(element => {
    const { lat, lon } = element;
    if (lat === undefined || lon === undefined) {
      return false;
    }
    const point = L.latLng(lat, lon);
    return bounds.contains(point);
  });
}

// Utility function to cluster markers by proximity
function clusterMarkers(data, threshold = 0.005) {
  const clustered = [];

  data.forEach((element) => {
    const { lat, lon, tags } = element;
    if (!lat || !lon) return;

    let addedToCluster = false;

    for (let cluster of clustered) {
      const clusterCenter = cluster.center;
      const distance = Math.sqrt(
        Math.pow(lat - clusterCenter.lat, 2) + Math.pow(lon - clusterCenter.lon, 2)
      );

      if (distance < threshold) {
        // Add to the existing cluster
        cluster.points.push(element);
        cluster.center.lat = (cluster.center.lat + lat) / 2;
        cluster.center.lon = (cluster.center.lon + lon) / 2;
        // Set the cluster's name to the name of the first marker
        cluster.name = cluster.points[0].tags?.name || '';
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      // Create a new cluster with the name of the first marker
      clustered.push({
        center: { lat, lon },
        points: [element],
        name: tags?.name || '',
      });
    }
  });

  return clustered;
}

function CombinedMap() {
  const [data, setData] = useState([]);
  const [cctvData, setCctvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bounds, setBounds] = useState(null);
  const [mapType, setMapType] = useState('cctv');

  useEffect(() => {
    const fetchPoliceStationsData = async () => {
      try {
        const response = await fetch('/static/policestation.json');
        const data = await response.json();
        setData(data.elements || []);
      } catch (error) {
        console.error('Error fetching police stations data:', error);
      }
    };

    const fetchCctvData = async () => {
      try {
        const response = await axios.get('/cctvdata');
        setCctvData(response.data);
      } catch (error) {
        console.error('Error fetching CCTV data:', error);
      }
    };

    fetchPoliceStationsData();
    fetchCctvData();
    setLoading(false);
  }, []);

  const handleBoundsChange = (newBounds) => {
    setBounds(newBounds);
  };

  const filteredData = bounds ? filterDataByBounds(data, bounds) : [];
  const clusteredData = clusterMarkers(filteredData);

  const getMarkerIcon = (status) => {
    return L.icon({
      iconUrl: status === 'active' ? activemarker : inactivemarker,
      iconSize: [27, 27],
      iconAnchor: [13, 27],
      popupAnchor: [0, -27],
    });
  };

  const getCircle = (lat, lng) => {
    return (
      <Circle
        center={[lat, lng]}
        radius={20}
        color="blue"
        fillColor="blue"
        fillOpacity={0.2}
      />
    );
  };

  return (
    <div className="CombinedMap">
      <div className="map-top">
      <div className="map-selector">
        <select onChange={(e) => setMapType(e.target.value)} value={mapType}>
          <option value="cctv">CCTV Map</option>
          <option value="police">Police Station Map</option>
          <option value="both">Both</option>
        </select>
      </div>
    </div>
      <MapContainer
        center={[19.0760, 72.8777]} // Mumbai coordinates
        zoom={12}
        style={{ height: '85vh', width: '80vw' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          
        />
        <MapEvents onBoundsChange={handleBoundsChange} />

        {mapType === 'police' || mapType === 'both' ? (
          clusteredData.map((cluster, index) => {
            const { lat, lon } = cluster.center;
            const stationName = cluster.name; // Use the representative name for the cluster

            return (
              <Marker
                key={`police-${index}`}
                position={[lat, lon]}
                icon={L.icon({
                  iconUrl: policestationmarker,
                  iconSize: [25, 25],
                  iconAnchor: [16, 32],
                  popupAnchor: [0, -32]
                })}
              >
                <Popup>
                  <strong>Police Station:</strong><br />
                  {stationName}
                </Popup>
              </Marker>
            );
          })
        ) : null}

        {mapType === 'cctv' || mapType === 'both' ? (
          cctvData.map((cctv) => (
            <React.Fragment key={`cctv-${cctv.cctvid}`}>
              <Marker
                position={[cctv.latitude, cctv.longitude]}
                icon={getMarkerIcon(cctv.status)}
              >
                <Popup>
                  <strong>CCTV ID:</strong> {cctv.cctvid} <br />
                  <strong>Status:</strong> {cctv.status} <br />
                </Popup>
              </Marker>
              {getCircle(cctv.latitude, cctv.longitude)}
            </React.Fragment>
          ))
        ) : null}

        {loading && <div>Loading...</div>}
      </MapContainer>
    </div>
  );
}

export default CombinedMap;
