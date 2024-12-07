import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Card,Progress, CardBody, CardTitle, FormGroup, Label, Col, Table, Button, 
  CardHeader,Modal, ModalHeader, ModalBody, ModalFooter ,Row,Container,Form,Input,
  FormFeedback} from 'reactstrap';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import Select from 'react-select';
import StudentsPrediction from './StudentsPrediction';
import { useAuth } from "../../AuthContext"; 



const DatasetPrediction = () => {
  const [data, setData] = useState({ file: null, rows: [] });
  const [columns, setColumns] = useState([]);
  const [course, setCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [alertModal, setalertModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({ rows: 0, gradeCounts: {} });
  const [isPredicted, setIsPredicted] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { isAuthenticated, authenticate } = useAuth();
  const [password, setPassword] = useState(""); // For the password input
  const [passwordError, setPasswordError] = useState(""); // For validation errors
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility


  const handlePasswordSubmit = () => {
    const success = authenticate(password);
    if (!success) {
      setPasswordError("Incorrect password. Please try again.");
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get("http://localhost:8080/api/courses")
        .then((response) => {
          setCourses(response.data);
        })
        .catch(() => {
          setError("Failed to fetch courses");
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/courses')
      .then(response => {
        setCourses(response.data);
      })
      .catch(() => {
        setError('Failed to fetch courses');
        setalertModal(true);
      });
  }, []);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
  
    if (fileExtension === 'xlsx' || fileExtension === 'csv') {
      const reader = new FileReader();
  
      setUploadProgress(20); // Set initial progress when file is selected
  
      reader.onloadstart = () => {
        setUploadProgress(40); // Progress when reading starts
      };
  
      reader.onload = (event) => {
        setUploadProgress(70); // Progress while processing file
  
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(2) + " KB" }); // Store file info
  
        if (jsonData.length > 0) {
          setColumns(Object.keys(jsonData[0]).map(col => col.toLowerCase()));
          setData({
            file: file,
            rows: jsonData.map(row => ({
              ...row,
              Prediction: '' 
            }))
          });
          setUploadProgress(100); // Mark as complete
        }
      };
  
      reader.onerror = () => {
        setError('Failed to process the file. Please try again.');
        setalertModal(true);
        setUploadProgress(0); // Reset progress on error
      };
  
      reader.readAsArrayBuffer(file);
    } else {
      setError('Please upload a valid Excel or CSV file.');
      setalertModal(true);
      setUploadProgress(0); // Reset progress for invalid file type
    }
  };
  
  

  const uploadDatasetForPrediction = async () => {
    if (!course) {
      setError('Please select a course.');
      setalertModal(true);
      return;
    }

    if (!data.file) {
      setError('Please upload a dataset.');
      setalertModal(true);
      return;
    }
      // Find course details by name
      let selectedCourse;
      try {
        console.log(courses);
        selectedCourse = courses.find(courseItem => courseItem.name === course  &&  courseItem.name !=='final');
        if (!selectedCourse) {
          setError('Selected course not found. Please try again.');
          setalertModal(true);
          return;
        }
      } catch (error) {
        setError('Error fetching course details. Please try again.');
        setalertModal(true);
        return;
      }

      // Extract expected assessments from the selected course
      const expectedAssessments = selectedCourse.assessments.map(a => a.assessment.toLowerCase());

      // Validate uploaded columns against expected assessments
      const allColumnsMatch = columns.every(col => expectedAssessments.includes(col.toLowerCase()));
      if (!allColumnsMatch) {
        setError('Uploaded columns contain invalid assessments. Please verify your dataset.');
        setalertModal(true);
        return;
      }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('course_name', course);
      formData.append('prediction_only', 'true');

      const res = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const predictions = res.data.predictions || [];
      setData({ ...data, rows: predictions });

      const gradeCounts = predictions.reduce((acc, row) => {
        const grade = row.Prediction;
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {});

      setDetails({ rows: predictions.length, gradeCounts });
      setIsPredicted(true);
    } catch (error) {
      console.error('Error predicting dataset:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Unknown error occurred.');
      setalertModal(true);
    } finally {
      setLoading(false);
    }
  };
   
  const toggleAlertModal = () => {
    setalertModal(!alertModal);
    setError(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.xlsx, .csv',
  });
  if (!isAuthenticated) {  
    return (
      <Container className="mt-5" style={{ maxWidth: "400px" }}>
        <Card>
          <CardHeader className="text-center">
            <h3>Enter Password</h3>
          </CardHeader>
          <CardBody>
            <Form onSubmit={(e) => e.preventDefault()}>
              <FormGroup>
                <Label for="password">Password</Label>
                <div className="input-group">
                  <Input
                    type={showPassword ? "text" : "password"} // Toggle between text and password
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={`form-control ${passwordError ? "is-invalid" : ""}`}
                  />
                  <Button
                    color="secondary"
                    className="input-group-text"
                    onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                    style={{
                      borderRadius: "0 0.25rem 0.25rem 0", // Match the input field styling
                    }}
                  >
                    {showPassword ? "Hide" : "Show"} {/* Button text changes dynamically */}
                  </Button>
                </div>
                {passwordError && (
                  <FormFeedback className="d-block">{passwordError}</FormFeedback>
                )}
              </FormGroup>
              <Button
                color="dark"
                onClick={handlePasswordSubmit}
                className="w-100"
              >
                Submit
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Container>
    );
  }
  
  return (
    <Row>
        <Col>
        <div
          style={{
            padding: '20px',
            margin: '0 auto',
            paddingTop: '0px',
            paddingLeft:'100px'
          }}
          className="container my-5"
        >
      {/* Course Selection */}
      <Card 
      className="shadow-sm mb-4">
      <CardHeader
          className="text-center text-white"
          style={{
            backgroundColor: "#212529",
            borderBottom: "2px solid #17a2b8",
          }}
        >
          <h3>Dataset Grade Prediction</h3>
        </CardHeader>
        <CardBody>
          <CardTitle tag="h5" className="text-secondary mb-3">
            <strong>Select Course</strong>
          </CardTitle>
          <FormGroup>
            <Label for="courseSelect" className="text-muted">Choose a course before uploading the dataset</Label>
            <Select
              id="courseSelect"
              options={courses.map((courseItem) => ({
                value: courseItem.name,
                label: courseItem.name,
              }))}
              placeholder="-- Select Course --"
              onChange={(selectedOption) => setCourse(selectedOption?.value)}
              isSearchable={true} // Enables search functionality
              classNamePrefix="react-select"
            />
          </FormGroup>
          <FormGroup>
            {isPredicted &&(
              <Button outline onClick={()=>window.location.reload()}>Predict Again</Button>
            )}
          </FormGroup>
        </CardBody>
      </Card>

      {/* File Upload Section */}
      {!isPredicted && course &&(
        <Card className="shadow-sm mb-4">
          <CardBody>
            <CardTitle tag="h5" className="text-secondary mb-3">
              <strong>Upload Dataset</strong>
            </CardTitle>
            <div
              {...getRootProps()}
              className="p-4 border rounded bg-light text-center"
              style={{ cursor: 'pointer' }}
            >
              <input {...getInputProps()} />
              <p className="text-muted mb-0">Drag & drop a .csv or .xlsx file here, or click to select</p>
              <Button color="dark" outline className="mt-3">Choose File</Button>
            </div>
          </CardBody>
                <div className="p-2 text-center">
                <Progress value={uploadProgress} className="my-3" color="info">
                {uploadProgress  && `${uploadProgress}%`}
                </Progress>
                </div>
        </Card>
      )}
             

      {/* Table and Prediction Button */}
      {data.rows && data.rows.length > 0 && (
        <Card className="shadow-sm">
          <CardBody>
            <CardTitle tag="h5" className="text-secondary mb-3">
              <strong>{loading?'Dataset Preview' :'Dataset Details'}</strong>
              {fileInfo && (
                  <div className="file-info mt-3">
                    <p><strong>File Name:</strong> {fileInfo.name}</p>
                    <p><strong>File Size:</strong> {fileInfo.size}</p>
                  </div>
                )}
            </CardTitle>
            {isPredicted ?null:
                <button 
                onClick={uploadDatasetForPrediction}
                disabled={loading}
                class="continue-application">
                  <div>
                      <div class="pencil"></div>
                      <div class="folder">
                          <div class="top">
                              <svg viewBox="0 0 24 27">
                                  <path d="M1,0 L23,0 C23.5522847,-1.01453063e-16 24,0.44771525 24,1 L24,8.17157288 C24,8.70200585 23.7892863,9.21071368 23.4142136,9.58578644 L20.5857864,12.4142136 C20.2107137,12.7892863 20,13.2979941 20,13.8284271 L20,26 C20,26.5522847 19.5522847,27 19,27 L1,27 C0.44771525,27 6.76353751e-17,26.5522847 0,26 L0,1 C-6.76353751e-17,0.44771525 0.44771525,1.01453063e-16 1,0 Z"></path>
                              </svg>
                          </div>
                          <div class="paper"></div>
                      </div>
                  </div>
                  Go Predict 
              </button>
            }
            {isPredicted && (
              <CSVLink
                data={data.rows.map((row) => {
                  // Ensure Prediction column is the last column
                  const rowWithPredictionLast = { ...row };
                  if (rowWithPredictionLast.Prediction !== undefined) {
                    const predictionValue = rowWithPredictionLast.Prediction;
                    delete rowWithPredictionLast.Prediction;
                    rowWithPredictionLast.Prediction = predictionValue; // Add it back as the last key
                  }
                  return rowWithPredictionLast;
                })}
                filename={`${course}_predicted_dataset.csv`}
                className="no-underline btn mt-3"
                style={{ position: 'absolute', left: 0 }}
              >
                <button className="button">
                  <span className="button__text">Download</span>
                  <span className="button__icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 35 35"
                      id="bdd05811-e15d-428c-bb53-8661459f9307"
                      data-name="Layer 2"
                      className="svg"
                    >
                      <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path>
                      <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path>
                      <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path>
                    </svg>
                  </span>
                </button>
              </CSVLink>
            )}

           {isPredicted?<div> <div className="mt-8">
              <br></br><br></br><br></br><br></br>
               <h6><strong>Total Rows:</strong> {details.rows}</h6>
               <Table bordered responsive className="table-sm mt-4 text-center">
                <thead className="thead-light">
                  <tr>
                    <th colSpan={Object.keys(details.gradeCounts).length} className="text-primary">
                      <strong style={{ color: '#17a2b8' }}>Grade Count:</strong>
                    </th>
                  </tr>
                  <tr>
                    {Object.keys(details.gradeCounts).map((grade, index) => (
                      <th key={index} style={{ width: `${100 / Object.keys(details.gradeCounts).length}%` }}>
                        {grade}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.values(details.gradeCounts).map((count, index) => (
                      <td key={index} style={{ width: `${100 / Object.values(details.gradeCounts).length}%` }}>
                        {count}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </Table>
            </div>
            <strong style={{ color: '#17a2b8'}}>First 5 Rows:</strong>
            <Table bordered responsive className="table-sm ">
              <thead className="thead-light">
                <tr>
                  {columns.map((column, index) => (
                    <th key={index}>{column}</th>
                  ))}
                  <th>Prediction</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex}>{row[column]}</td>
                    ))}
                    <td>{row.Prediction}</td>
                  </tr>
                ))}
              </tbody>
            </Table></div>:null}
          </CardBody>
        </Card>
      )}

      {/* Error Modal */}
      <Modal isOpen={alertModal} toggle={toggleAlertModal}>
        <ModalHeader toggle={toggleAlertModal}>Error</ModalHeader>
        <ModalBody>
          <p>{error}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleAlertModal}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
      </Col>
      <Col>
      <StudentsPrediction/>
      </Col>
      </Row>
  );
};

export default DatasetPrediction;
