import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  FormGroup,
  Label,
  Input,
  Form,
  Button,
  Alert,
  Container,
  FormFeedback
} from "reactstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { useAuth } from "../../AuthContext"; 



const DatasetUpload = () => {
  const [columns, setColumns] = useState([]);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState({ type: null, content: "" });
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [loading , setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const [isUploadVisible, setIsUploadVisible] = useState(false);
  const [courses, setCourses] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [file, setFile] = useState(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false); // New state for overlay visibility
  const NavTo = useNavigate();
  const { isAuthenticated, authenticate } = useAuth();
  const [password, setPassword] = useState(""); // For the password input
const [passwordError, setPasswordError] = useState(""); // For validation errors
const [error, setError] = useState(null);
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
        .get("https://student-prediction-db.onrender.com/api/courses")
        .then((response) => {
          setCourses(response.data);
        })
        .catch(() => {
          setError("Failed to fetch courses");
        });
    }
  }, [isAuthenticated]);

  const currentYear = new Date().getFullYear();
  const academicYears = Array.from(
    { length: currentYear - 2014 + 1 },
    (_, i) => `${2014 + i}-${2015 + i}`
  );

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    setIsUploadVisible(course && semester && academicYear);
  }, [course, semester, academicYear]);

  useEffect(() => {
    axios
      .get("https://student-prediction-db.onrender.com/api/courses")
      .then((response) => {
        setCourses(response.data);
      })
      .catch(() => {
        showMessage("error", "Failed to fetch courses. Please try again later.");
      });
  }, []);

  const TrainModel = async () => {
    if (!course) {
      showMessage("error", "Please select a course name.");
      return;
    }
  
    setLoading(true);
  
    try {
      // Fetch datasets for the selected course
      const response = await axios.get("https://student-prediction-db.onrender.com/api/datasets/filter", {
        params: { course },
      });
      const datasets = response.data;
  
      // Filter datasets by semesters
      const sem1Data = datasets.find((dataset) => dataset.sem === "sem1");
      const sem2Data = datasets.find((dataset) => dataset.sem === "sem2");
  
      let csvData = [];
      let fileName = "";
  
      if (sem1Data && sem2Data) {
        // Concatenate Sem1 and Sem2 data if both exist
        csvData = [...sem1Data.data, ...sem2Data.data];
        fileName = `${course}_Sem1_Sem2_Combined.csv`;
      } else if (sem1Data) {
        // Use Sem1 data if only Sem1 exists
        csvData = sem1Data.data;
        fileName = `${course}_Sem1.csv`;
      } else if (sem2Data) {
        // Use Sem2 data if only Sem2 exists
        csvData = sem2Data.data;
        fileName = `${course}_Sem2.csv`;
      } else {
        showMessage("error", "No datasets found for the selected course.");
        setLoading(false);
        return;
      }
  
      // Create a CSV file from the dataset
      const csvContent = [
        datasets[0].columns.join(","),
        ...csvData.map((row) => row.join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const file = new File([blob], fileName);
  
      // Send the CSV file to the server for training
      const formData = new FormData();
      formData.append("file", file);
      formData.append("course_name", courses.find((courseItem) => courseItem._id === course)?.name);
  
      const uploadResponse = await axios.post("https://student-prediction-ml.onrender.com/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      showMessage("success", "Model training initiated successfully!");
      console.log("Training response:", uploadResponse.data);
    } catch (err) {
      console.error("Error during training:", err);
      showMessage("error", err.response?.data?.error || "Failed to train the model. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: null, content: "" }), 15000);
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const fileExtension = file.name.split(".").pop().toLowerCase();
  
    if (file.size > MAX_FILE_SIZE) {
      showMessage("error", "File size exceeds the 5MB limit.");
      setProgress(0);
      return;
    }
  
    if (!["xlsx", "csv"].includes(fileExtension)) {
      showMessage("error", "Please upload a valid Excel or CSV file.");
      setProgress(0);
      return;
    }
  
    setProgress(20);
  
    setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(2) + " KB" }); // Store file info
    setFile(file); // Save the file for later use in TrainModel
  
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      try {
        const workbook = XLSX.read(new Uint8Array(target.result), { type: "array" });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
          header: 1,
        });
  
        if (jsonData.length) {
          setColumns(jsonData[0].map((column) => column.toLowerCase()));
          setDataset(jsonData.slice(1));
          setProgress(100);
        }
      } catch (error) {
        showMessage("error", "Failed to process the file. Ensure it is a valid Excel or CSV.");
        setProgress(0);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  
  const handleSubmitDataset = async () => {
    if (!course || !semester || !academicYear || columns.length === 0 || dataset.length === 0) {
        showMessage("error", "All fields and a valid dataset file are required.");
        return;
    }

    // Fetch course details to validate assessments
    let courseDetails;
    try {
        const res = await axios.get(`https://student-prediction-db.onrender.com/api/courses/${course}`);
        courseDetails = res.data;
    } catch (error) {
        showMessage("error", "Failed to fetch course details. Please try again.");
        return;
    }

    // Extract expected assessments from the course details
// Add "grade" assessment to expectedAssessments
const expectedAssessments = [
  ...courseDetails.assessments.map((a) => a.assessment.toLowerCase()),
  "grade" // Adding "grade" as an assessment
];

// Check if all uploaded column names exist in the expected assessments
const unmatchedColumns = columns.filter((col) => !expectedAssessments.includes(col.toLowerCase()));

if (unmatchedColumns.length > 0) {
  showMessage(
      "error",
      `The following columns are not valid assessments for this course: ${unmatchedColumns.join(", ")}.`
  );
  return;
}


    // Check if the number of columns matches the expected number of assessments
    if (columns.length !== expectedAssessments.length) {
        showMessage(
            "error",
            `The number of columns (${columns.length}) does not match the number of assessments (${expectedAssessments.length}).`
        );
        return;
    }

    // Prepare payload for submission
    const payload = {
        course,
        sem: semester,
        academicYear,
        columns,
        data: dataset,
        concat: false, // Default behavior: Do not append
    };

    try {
        const res = await axios.put("https://student-prediction-db.onrender.com/api/add-dataset", payload);
        showMessage("success", res.data.message);
        setIsOverlayVisible(true); // Show overlay on success
    } catch (error) {
        if (error.response?.status === 409) {
            const shouldAppend = window.confirm(
                "A dataset with the same course name and semester already exists. Would you like to append the data?"
            );

            if (shouldAppend) {
                try {
                    payload.concat = true; // Enable appending
                    const appendRes = await axios.put("https://student-prediction-db.onrender.com/api/add-dataset", payload);
                    showMessage("success", appendRes.data.message);
                    setIsOverlayVisible(true); // Show overlay on append success
                } catch (appendError) {
                    showMessage("error", "Sorry!! Failed to append dataset because Model already Trained for the this academic year !!.");
                    console.error(appendError);
                }
            } else {
                showMessage("info", "Dataset upload cancelled.");
            }
        } else {
            showMessage("error", error.response?.data?.error || "Failed to submit dataset. Please try again.");
        }
    }
};

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ".xlsx, .csv" });
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
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "0 auto",
        paddingTop: "0px",
      }}
      className="container my-5"
    >      <Card className="shadow-sm">
        <CardHeader
          className="text-center text-white"
          style={{
            backgroundColor: "#212529",
            borderBottom: "2px solid #17a2b8",
          }}
        >
          <h3>Upload Datasets For Training</h3>
        </CardHeader>
        <CardBody>
          {message.content && (
            <Alert color={message.type === "error" ? "danger" : message.type === "success" ? "success" : "info"}>
              {message.content}
            </Alert>
          )}
          <Form>
          <FormGroup>
            <Label for="courseSelect" className="text-secondary">
              <strong>Course Name</strong>
            </Label>
            <Select             
              id="courseSelect"
              options={courses.map((course) => ({
                value: course._id,
                label: course.name,
              }))}
              placeholder="-- Select Course --"
              onChange={(selectedOption) => setCourse(selectedOption?.value)}
              isSearchable={true} // Enables search functionality
              classNamePrefix="react-select"
            />
          </FormGroup>

            <FormGroup tag="fieldset">
              <h4 className="text-secondary">Semester</h4>
              {["Sem1", "Sem2"].map((sem) => (
                <FormGroup check key={sem}>
                  <Label check>
                    <Input
                      type="radio"
                      name="semester"
                      value={sem}
                      checked={semester === sem}
                      onChange={(e) => setSemester(e.target.value)}
                    />{" "}
                    <strong>{sem}</strong>
                  </Label>
                </FormGroup>
              ))}
            </FormGroup>

            <FormGroup>
              <Label for="academicYearSelect" className="text-secondary">
                <strong>Academic Year</strong>
              </Label>
              <Input
                type="select"
                id="academicYearSelect"
                style={{width:'24%'}}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="">Select an academic year</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Form>

          {isUploadVisible && (
            <div>
              <div
                  {...getRootProps()}
                  className="p-4 border rounded bg-light text-center"
                  style={{ cursor: "pointer" }}
                >
                  <input {...getInputProps()} />
                  <p className="text-muted">
                    Drag & drop an Excel or CSV file here, or click to select a file
                  </p>
                  <Button color="dark" outline>Choose File</Button>
                </div>

                {/* File information display */}
                {fileInfo && (
                  <div className="file-info mt-3">
                    <p><strong>File Name:</strong> {fileInfo.name}</p>
                    <p><strong>File Size:</strong> {fileInfo.size}</p>
                  </div>
                )}
              <Progress value={progress} className="my-3" color="info">
                {progress > 0 && `${progress}%`}
              </Progress>

              <FormGroup>
                {/* <Button onClick={handleSubmitDataset}>Confirm Submission</Button> */}
                <button 
                onClick={handleSubmitDataset}
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
                  Confirm Submission
              </button>
              </FormGroup>
            </div>
          )}


        </CardBody>
      </Card>

      {/* Overlay for Post-Submission or Append Actions */}
      {isOverlayVisible && (
    <div className="overlay-container">
      <div className="overlay-content">
      <h2 className="overlay-title">Dataset Processed Successfully!</h2>
      <p className="overlay-message">
      Your dataset has been successfully submitted or appended. What would you like to do next?
      </p>
       <div className="overlay-actions">
        <button
        className="overlay-button-primary"
        onClick={() => {
          TrainModel();
          setIsOverlayVisible(false);
        }}
      >
        Train Model
      </button>
      <button
        className="overlay-button-success"
        onClick={() => {
          setIsOverlayVisible(false);
        }}
      >
        Upload More
      </button>
    </div>
  </div>
</div>)}

{loading && (
    <div className="overlay-container">
      <div className="overlay-content">
        <br></br><br></br><br></br><br></br>
        <br></br><br></br><br></br><br></br>
        <div class="banter-loader">
          <div class="banter-loader__box"></div>
          <div class="banter-loader__box"></div>
          <div class="banter-loader__box"></div>
          <div class="banter-loader__box"></div>
          <div class="banter-loader__box"></div>
          <div class="banter-loader__box"></div>
          <div class="banter-loader__box"></div>
          <div class="banter-loader__box"></div>
          <div class="banter-loader__box"></div>
          <br></br><br></br><br></br><br></br>
          <strong className="text-center text-info" > Loading...</strong>
          <br></br><br></br><br></br><br></br>
        </div>
      </div>
    </div>
)}


      <Card
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          width: "250px",
          zIndex: 1000,
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <CardBody>
            <button class="unique-button"
            onClick={()=>NavTo('/Download-Data')}>
            <div class="svg-wrap">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path
                    fill="currentColor"
                    d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                ></path>
                </svg>
            </div>
            <span>Go To Store</span>
            </button>
        </CardBody>
      </Card>
    </div>
  );
};

export default DatasetUpload;

