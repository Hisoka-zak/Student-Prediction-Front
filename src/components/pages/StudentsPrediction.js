import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Alert,
  CardHeader,
  CardTitle
} from "reactstrap";
import { BsLightningFill , BsFillCaretUpFill, BsFillCaretDownFill} from "react-icons/bs";
import axios from "axios";
import Select from 'react-select';

const StudentsPrediction = () => {
  const [courseId, setCourseId] = useState("");
  const [PreMsg, setPreMsg] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [marks, setMarks] = useState({});
  const [errors, setErrors] = useState({});

  const [visibleAssessments, setVisibleAssessments] = useState(1);

  const handleCourseChange = (e) => {
    setCourseId(e.target.value);
    const selectedCourse = courses.find((course) => course._id === e.target.value);
    setSelectedCourse(selectedCourse);
    setMarks({});
    setErrors({});
    setVisibleAssessments(1); // Reset visible assessments when a new course is selected
  };

  const handleMarkChange = (assessmentName, value, maxMark) => {
    const markValue = parseFloat(value);
    setMarks((prevMarks) => ({
      ...prevMarks,
      [assessmentName]: markValue,
    }));

    // Check if the value is within the allowed range
    if (markValue < 0 || markValue > maxMark) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [assessmentName]: `Mark must be between 0 and ${maxMark}.`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [assessmentName]: "",
      }));
    }  
  };

  const handleShowNext = () => {
    setVisibleAssessments((prev) => Math.min(prev + 1, selectedCourse.assessments.length));
  };

  const handleUndo = () => {
    setVisibleAssessments((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Exclude empty or hidden fields from the API call
    const filteredMarks = {};
    let hasErrors = false;
  
    Object.keys(marks).forEach((key) => {
      const assessmentIndex = selectedCourse.assessments.findIndex(
        (assessment) => assessment.assessment === key
      );
  
      if (assessmentIndex !== -1 && assessmentIndex < visibleAssessments) {
        const maxMark = selectedCourse.assessments[assessmentIndex].mark;
        const markValue = marks[key];
  
        // Validate range
        if (markValue < 0 || markValue > maxMark) {
          hasErrors = true;
          setErrors((prevErrors) => ({
            ...prevErrors,
            [key]: `Mark must be between 0 and ${maxMark}.`,
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [key]: "",
          }));
          filteredMarks[key] = markValue;
        }
      }
    });
  
    // If there are errors, prevent submission
    if (hasErrors) {
      setPreMsg("Please correct the errors before submission.");
      return;
    }
  
    // Check if there are any fields to predict
    if (Object.keys(filteredMarks).length === 0) {
      setPreMsg("Please fill in at least one visible assessment mark to predict.");
      return;
    }
  
    try {
      const res = await axios.post("https://student-prediction-ml.onrender.com/predict", {
        course_name: selectedCourse.name,
        inputs: filteredMarks,
      });
      setPreMsg(`The machine predicts your grade as "${res.data.predictions[0]}"`);
    } catch (error) {
      console.error("Error making prediction:", error);
      setPreMsg(error.response?.data?.error || "An unknown error occurred.");
    }
  
    console.log("Filtered Marks Sent:", filteredMarks);
  };
  
  useEffect(() => {
    axios
      .get("https://student-prediction-db.onrender.com/api/courses")
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch courses", error);
      });
  }, []);

  return (
    <Container
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        paddingTop: "50px",
      }}
    >
      <Card className="shadow-sm">
      <CardHeader
          className="text-center text-white"
          style={{
            backgroundColor: "#212529",
            borderBottom: "2px solid #17a2b8",
          }}
        >
          <h3>Student Grade Prediction</h3>
        </CardHeader>
        <CardBody>
        <CardTitle tag="h5" className="text-secondary mb-3">
            <strong>Select Course</strong>
          </CardTitle>
          <FormGroup>
            <Label for="courseSelect" className="text-muted">Choose a course to predict your grade</Label>
            <Select
              id="courseSelect"
              className="text-primary"
              options={courses.map((course) => ({
                value: course._id,
                label: course.name,
              }))}
              placeholder="-- Select Course --"
              onChange={(selectedOption) => handleCourseChange({ target: { value: selectedOption?.value } })}
              isSearchable={true} // Enables the search bar
            />
          </FormGroup>

          {/* Assessment Inputs - Show only if Course is selected */}
          {selectedCourse && (
            <Form>
              <FormGroup className="text-center">
                  <Label style={{color:'navy'}}>
                    <strong>-- You can predict your grade by enter any mark --</strong>
                  </Label>
              </FormGroup>
              {selectedCourse.assessments.map((element, index) => {
                if (element.assessment.toLowerCase() === "final") return null; // Skip "Final" assessment
                if (element.assessment.toLowerCase() === "grade") return null; // Skip "grade" assessment
                if (index >= visibleAssessments) return null; // Hide assessments beyond the visible count

                return (
                  <div key={element.assessment} className="mb-3">
                    <Row className="align-items-center mb-3">
                      <Col xs="8">
                        <FormGroup>
                          <Label
                            for={`assessmentSelect-${element.assessment}`}
                            className="text-secondary"
                          >
                            <strong>Assessment Name</strong>
                          </Label>
                          <Input
                            disabled
                            type="text"
                            id={`assessmentSelect-${element.assessment}`}
                            value={element.assessment}
                            className="text-primary"
                          />
                        </FormGroup>
                      </Col>

                      <Col xs="4">
                        <FormGroup>
                          <Label className="text-secondary">
                            <strong>Enter Mark</strong>
                          </Label>
                          <Input
                            type="number"
                            placeholder={`0 to ${element.mark}`}
                            className="text-center text-primary"
                            style={{ backgroundColor: "#f0f8ff" }}
                            value={marks[element.assessment] !== undefined ? marks[element.assessment] : ""}
                            onChange={(e) =>
                              handleMarkChange(
                                element.assessment,
                                e.target.value,
                                element.mark
                              )
                            }
                          />
                          {errors[element.assessment] && (
                            <div
                              className="text-danger"
                              style={{ fontSize: "12px" }}
                            >
                              {errors[element.assessment]}
                            </div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                );
              })}
              <div className="d-flex justify-content-between">
              <Button
                onClick={handleShowNext}
                color="dark"
                className="me-2 mt-3"
                disabled={visibleAssessments >= selectedCourse.assessments.length}
              >
               Next Assessment <BsFillCaretDownFill />
              </Button>
              <Button
                onClick={handleUndo}
                color="dark"
                className="mt-3 text-light"
                disabled={visibleAssessments <= 1}
              >
                Hide Assessment <BsFillCaretUpFill />
              </Button>
              </div>
              <FormGroup>
              <Button onClick={handleSubmit} style={{backgroundColor: '#17a2b8' }} className="mt-3">
                <strong className="text-light">Predict Grade <BsLightningFill /></strong>
              </Button>
              </FormGroup>
            </Form>
          )}
          {PreMsg && (
            <div className="mt-4">
              <Alert color="info" 
               className="text-center text-dark">
                <h5>{PreMsg}</h5>
                </Alert>
            </div>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default StudentsPrediction;
