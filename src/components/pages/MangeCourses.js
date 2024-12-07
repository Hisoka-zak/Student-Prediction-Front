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
  CardHeader,
  FormFeedback,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { BsFillCaretUpFill, BsFillCaretDownFill } from "react-icons/bs";
import { MdAddToPhotos } from "react-icons/md";
import Select from "react-select";
import { useAuth } from "../../AuthContext"; 


import axios from "axios";

const assessments = [
  "quiz",
  "quiz1",
  "quiz2",
  "test 1",
  "test 2",
  "assignment",
  "assignment 1",
  "assignment 2",
  "course work 1",
  "course work 2",
  "course work 3",
  "course work 4",
  "project",
  "midterm",
  "practical test",
  "presentation",
  "group activity",
  "lab activity",
  "class activity",
  "class participation",
  "self study",
  "activity 1",
  "activity 2",
  "final",
  "others",
];

const InsertCourses = () => {
  const NavTo = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [assessmentSelections, setAssessmentSelections] = useState([]);
  const [errors, setErrors] = useState([]);
  const [totalMarksError, setTotalMarksError] = useState("");
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const { isAuthenticated, authenticate } = useAuth();
  const [password, setPassword] = useState(""); // For the password input
  const [passwordError, setPasswordError] = useState(""); // For validation errors
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility



  const handleCourseChange = (selectedOption) => {
    const selectedCourse = courses.find(
      (course) => course.name === selectedOption.value
    );
    setCourseName(selectedOption.value);

    // Pre-fill assessments and marks if the course exists
    if (selectedCourse) {
      setAssessmentSelections(
        selectedCourse.assessments.map((assessment) => ({
          type: assessment.assessment,
          mark: assessment.mark,
        }))
      );
    } else {
      // Reset if no course is selected
      setAssessmentSelections([{ type: "", mark: "" }]);
    }
  };

  const validateMarks = (index, value) => {
    let markError = "";
    if (value === "" || isNaN(value)) {
      markError = "Please enter a valid mark.";
    } else if (value < 0 || value > 100) {
      markError = "Marks must be between 0 and 100.";
    }
    const updatedErrors = [...errors];
    updatedErrors[index] = markError;
    setErrors(updatedErrors);
  };

  const validateTotalMarks = () => {
    let totalMarks = 0;
    let validMarks = true;
    for (let i = 0; i < assessmentSelections.length; i++) {
      const mark = assessmentSelections[i].mark;
      if (mark !== "" && !isNaN(mark)) {
        totalMarks += parseInt(mark, 10);
      }
      if (mark === "" || isNaN(mark) || mark < 0 || mark > 100) {
        validMarks = false;
      }
    }
    if (validMarks && totalMarks === 100) {
      setTotalMarksError("");
      return true;
    } else {
      setTotalMarksError("Total marks must equal 100.");
      return false;
    }
  };

  const handleAssessmentChange = (index, field, value) => {
    const updatedSelections = [...assessmentSelections];
    updatedSelections[index] = { ...updatedSelections[index], [field]: value };
    setAssessmentSelections(updatedSelections);

    if (field === "mark") {
      validateMarks(index, value);
    }
    validateTotalMarks();
  };

  const handleAddMore = () => {
    setAssessmentSelections([
      ...assessmentSelections,
      { type: "", mark: "" },
    ]);
    setErrors([...errors, ""]);
  };

  const handleUndo = () => {
    if (assessmentSelections.length > 1) {
      setAssessmentSelections(assessmentSelections.slice(0, -1));
      setErrors(errors.slice(0, -1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateTotalMarks()) {
      const courseData = {
        name: courseName,
        assessments: assessmentSelections.map((selection) => ({
          assessment: selection.type,
          mark: selection.mark,
        })),
      };

      try {
        const course = courses.find((c) => c.name === courseName);
        if (course) {
          await axios.put(
            `http://localhost:8080/api/updateCourse/${course._id}`,
            courseData
          );
          alert("Course updated successfully!");
        } else {
          alert("Course not found!");
        }
      } catch (error) {
        console.error("Error updating course:", error);
        setError("Failed to update course");
      }
    }
  };

  const getFilteredOptions = (index) => {
    const selectedTypes = assessmentSelections
      .map((selection) => selection.type)
      .filter((type) => type);

    return assessments.filter(
      (assessment) =>
        !selectedTypes.includes(assessment) ||
        assessment === assessmentSelections[index].type
    );
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/courses")
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        setError("Failed to fetch courses");
      });
  }, []);

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
    <Container style={{ paddingTop: "50px", maxWidth: "800px", marginBottom: "150px" }}>
      <Card
        className="shadow-lg border-0"
        style={{ borderTop: "5px solid #17a2b8" }}
      >
        <CardHeader
          className="text-center text-white"
          style={{
            backgroundColor: "#212529",
            borderBottom: "2px solid #17a2b8",
          }}
        >
          <h3>Manage Course Assessments</h3>
        </CardHeader>
        <CardBody>
          <FormGroup>
            <Label for="courseSelect" className="text-secondary">
              <strong>Select Course</strong>
            </Label>
            <Select
              id="courseSelect"
              className="text-primary"
              options={courses.map((course) => ({
                value: course.name,
                label: course.name,
              }))}
              placeholder="-- Select Course --"
              onChange={handleCourseChange}
              isSearchable={true}
            />
          </FormGroup>

          {courseName && (
            <Form onSubmit={handleSubmit}>
              {assessmentSelections.map((selection, index) => (
                <Row key={index} className="align-items-center mb-3">
                  <Col xs="8">
                    <FormGroup>
                      <Label
                        for={`assessmentSelect${index}`}
                        className="text-secondary"
                      >
                        <strong>Assessment {index + 1}</strong>
                      </Label>
                      <Input
                        type="select"
                        id={`assessmentSelect${index}`}
                        value={selection.type}
                        onChange={(e) =>
                          handleAssessmentChange(index, "type", e.target.value)
                        }
                        className="text-primary"
                      >
                        <option value="">-- Select Assessment --</option>
                        {getFilteredOptions(index).map((assessment) => (
                          <option key={assessment} value={assessment}>
                            {assessment}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup>
                      <Label className="text-secondary">
                        <strong>Mark</strong>
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter Mark"
                        value={selection.mark}
                        onChange={(e) =>
                          handleAssessmentChange(index, "mark", e.target.value)
                        }
                        className={`text-center text-primary ${
                          errors[index] ? "is-invalid" : ""
                        }`}
                      />
                      {errors[index] && (
                        <FormFeedback>{errors[index]}</FormFeedback>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
              ))}
              <div className="d-flex justify-content-between">
                <Button color="dark" onClick={handleAddMore}>
                  Add assessments <BsFillCaretDownFill />
                </Button>
                <Button
                  color="dark"
                  onClick={handleUndo}
                  disabled={assessmentSelections.length <= 1}
                >
                  Undo <BsFillCaretUpFill />
                </Button>
              </div>
              {totalMarksError && (
                <div className="text-danger mt-2">{totalMarksError}</div>
              )}
              <Button
                type="submit"
                style={{ backgroundColor: "#17a2b8" }}
                className="w-40 mt-3 text-light"
              >
                <MdAddToPhotos /> Update Assessments
              </Button>
            </Form>
          )}
        </CardBody>
      </Card>
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
            onClick={()=>NavTo('/addCourse')}>
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
            <span>Add Courses</span>
            </button>
        </CardBody>
      </Card>
    </Container>
  );
};

export default InsertCourses;
