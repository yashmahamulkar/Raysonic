import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import '../static/dashboard4.css'; 
import activemarker from '../static/images/activecctvmarker3.png';
import inactivemarker from '../static/images/inactivecctvmarker3.png';
import cctvalertlogo from '../static/images/cctvalert2.png';
import sosalertlogo from '../static/images/sosphone.png';

function Dashboard3() {
  const [totalPeople, setTotalPeople] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [chartData, setChartData] = useState([]); // For chart data
  const [cctvData, setCctvData] = useState([]); // For CCTV data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homepageResponse = await axios.get('/homepagedata');
        const chartResponse = await axios.get('/chartdata');
        const cctvResponse = await axios.get('/cctvdata'); // Get CCTV data

        setTotalPeople(homepageResponse.data.total_people);
        setMaleCount(homepageResponse.data.male_count);
        setFemaleCount(homepageResponse.data.female_count);

        // Transform chart data to aggregate by day
        const transformedData = chartResponse.data.timestamps.reduce((acc, timestamp, index) => {
          const date = new Date(timestamp).toLocaleDateString(); // Convert timestamp to date string
          if (!acc[date]) {
            acc[date] = { male_count: 0, female_count: 0 };
          }
          acc[date].male_count += chartResponse.data.male_count[index];
          acc[date].female_count += chartResponse.data.female_count[index];
          return acc;
        }, {});

        const sortedDates = Object.keys(transformedData).sort();
        const formattedChartData = sortedDates.map(date => ({
          date: date,
          male_count: transformedData[date].male_count,
          female_count: transformedData[date].female_count
        }));

        setChartData(formattedChartData);
        setCctvData(cctvResponse.data); // Store CCTV data

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Custom marker icon based on CCTV status
  const getMarkerIcon = (status) => {
    return L.icon({
      iconUrl: status === 'active' ? activemarker : inactivemarker,
      iconSize: [27, 27], // Adjust size here
      iconAnchor: [10, 34],
      popupAnchor: [1, -34],
    });
  };

  // Function to create circular region around marker
  const getCircle = (lat, lng) => {
    return (
      <Circle
        center={[lat, lng]}
        radius={20} // Radius in meters
        color="blue"
        fillColor="blue"
        fillOpacity={0.2}
      />
    );
  };

  return (
    <div>
      <div className="right_top">
        <div className="top_1">
          <div className="card-heading">Active Users</div>
          <div className="card-content">
            <i className="fas fa-users card-icon"></i>
            <div className="card-value">{totalPeople}</div>
          </div>
        </div>
        <div className="top_2">
          <div className="card-heading">Total Alerts</div>
          <div className="card-content">
            <i className="fas fa-bell card-icon"></i>
            <div className="card-value">801</div>
          </div>
        </div>
        <div className="top_3">
          <div className="card-heading">Active Cameras</div>
          <div className="card-content">
            <i className="fas fa-video card-icon"></i>
            <div className="card-value">500/501</div>
          </div>
        </div>
      </div>

      <div className="rightbottom">

        <div className="rightbottomleft">
          <div className="rightbottom-map">
          <MapContainer center={[19.0330, 73.0297]} zoom={12} >
          <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    
  />

            {cctvData.map((cctv) => (
              <React.Fragment key={cctv.cctvid}>
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
            ))}
          </MapContainer>
            </div>

          <div className="rightbottom_chart">
          <div className="chartheading" >
            Daily Count</div>
            <ResponsiveContainer>
            <AreaChart data={chartData}>

    <XAxis dataKey="date">
      <Label value="Date" offset={0} position="insideBottom" />
    </XAxis>
    <YAxis>
      <Label value="Count" angle={-90} position="insideLeft" />
    </YAxis>
    <Tooltip />
    <Legend layout="vertical" align="right" verticalAlign="top" />
    <Area
      type="monotone"
      dataKey="male_count"
      stroke="#36A2EB"
      fill="#36A2EB"
      fillOpacity={0.3}
      name="Male Count" // Legend label
    />
    <Area
      type="monotone"
      dataKey="female_count"
      stroke="#FF6384"
      fill="#FF6384"
      fillOpacity={0.3}
      name="Female Count" // Legend label
    />
  </AreaChart>
            </ResponsiveContainer>
          </div>



        </div>

        <div className="rightbottomright">
        <div className="rightbottom_warning" >
  <div className="warnings_top">
  <img src={cctvalertlogo} alt="cctvalert" className="cctvalertlogo"  />
    <span className="warning_heading">
    
      Surveillance Alerts</span>
  </div>
  <div className="warning_content" style={{ overflowY: 'auto', height: 'calc(100% - 40px)' }}>
    <div className="alert_list">

      <p>17 Sept 2024 16:38 : Unusual Activity detected at Panvel (CCTV No: 17). 
      </p>
     
      <p>17 Sept 2024 20:21 : Lone Women detected at Seawoods (CCTV No: 15).      </p>

    </div>
  </div>
</div>

<div className="rightbottom_sos" >
  <div className="sos_top">
   
    <img src={sosalertlogo} alt="cctvalert" className="cctvalertlogo"  />
    <span className="warning_heading"> SOS Alerts</span>
  </div>
  <div className="warning_content" style={{ overflowY: 'auto', height: 'calc(100% - 40px)' }}>
    <div className="alert_list">
      <p>2024-09-17 14:30 : SOS Alert from Priya at Panvel.</p>
      <p>2024-09-17 14:35 :  SOS Alert was issued at Seawoods.</p>
      <p>2024-09-17 14:40 : SOS Alert was issued at Kharghar.</p>
      <p>2024-09-17 14:45 :  SOS Alert was issued at Badlapur.</p>
    </div>
  </div>
</div>

</div>


      </div>
    </div>
  );
}

export default Dashboard3;
