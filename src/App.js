import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavbarComponent from './components/sections/NavbarComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import MangeCourses from './components/pages/MangeCourses';
import StudentsPrediction from './components/pages/StudentsPrediction';
import AddCourse from './components/pages/AddCourse';
import DatasetPrediction from './components/pages/DatasetPrediction';
import DatasetStore from './components/pages/DatasetUpload';
import DownloadData from './components/pages/DownloadData';
import Sliderimage from './components/sections/Sliderimage';

function App() {
  return (
    <Router>
      <div>
        <NavbarComponent />
        <Sliderimage/>
        <Routes>
          <Route path="/MangeCourses" element={<MangeCourses/>} />
          <Route path="/" element={<StudentsPrediction/>} />
          <Route path="/addcourse" element={<AddCourse/>} />
          <Route path="/Dataset-Prediction" element={<DatasetPrediction/>} />
          <Route path="/Dataset-Store" element={<DatasetStore/>} />
          <Route path="/Download-Data" element={<DownloadData/>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
