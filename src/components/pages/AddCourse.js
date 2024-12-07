import React, { useState, useEffect } from "react"
import {
  Container,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  ButtonGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddCourse = () => {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseId, setCourseId] = useState("");
  const [activeForm, setActiveForm] = useState("add");
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  let NavTo = useNavigate();
  // Toggle the modal
  const toggleModal = () => setModal(!modal);

  const showModal = (message) => {
    setModalMessage(message);
    setModal(true);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const newCourse = {
      name: courseName,
      code: courseCode,
    };
    try {
      const response = await axios.post("http://localhost:8080/api/addCourse", newCourse);
      showModal(response.data.message);
      setCourseName("");
      setCourseCode("");
      const updatedCourses = await axios.get("http://localhost:8080/api/courses");
      setCourses(updatedCourses.data);
    } catch (error) {
      console.error("Error adding course:", error);
      showModal("Course code already exists!");
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    const updatedCourse = {
      name: courseName,
      code: courseCode,
    };
    try {
      const response = await axios.put(`http://localhost:8080/api/updateCourse/${courseId}`, updatedCourse);
      showModal(response.data.message);
      setCourseName("");
      setCourseCode("");
      setCourseId("");
      const updatedCourses = await axios.get("http://localhost:8080/api/courses");
      setCourses(updatedCourses.data);
    } catch (error) {
      console.error("Error updating course:", error);
      showModal("Failed to update course. Please try again.");
    }
  };

  const handleDeleteCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.delete(`http://localhost:8080/api/deleteCourse/${courseId}`);
      showModal(response.data.message);
      setCourseId("");
      const updatedCourses = await axios.get("http://localhost:8080/api/courses");
      setCourses(updatedCourses.data);
    } catch (error) {
      console.error("Error deleting course:", error);
      showModal("Failed to delete course. Please try again.");
    }
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

  return (

    <Container style={{ paddingTop: "50px" , maxWidth: "900px",}}>
      <Card className="shadow-lg border-0" style={{ borderTop: "5px solid #17a2b8" }}>
        <CardHeader
          className="text-center text-white"
          style={{ backgroundColor: "#212529", borderBottom: "2px solid #17a2b8" }}
        >
          <h3>Course Management</h3>
        </CardHeader>
        <CardBody>
          <ButtonGroup className="w-100 mb-4">
          <Button
            style={{
              backgroundColor: activeForm === "add" ? "#17a2b8" : "#6c757d", 
              color: "#fff",
              borderColor: activeForm === "add" ? "#17a2b8" : "#6c757d",
            }}
            onClick={() => setActiveForm("add")}
          >
            Add Course
          </Button>
          <Button
            style={{
              backgroundColor: activeForm === "update" ? "#17a2b8" : "#6c757d",
              color: "#fff",
              borderColor: activeForm === "update" ? "#17a2b8" : "#6c757d",
            }}
            onClick={() => setActiveForm("update")}
          >
            Update Course
          </Button>
            <Button
              color={activeForm === "delete" ? "danger" : "secondary"}
              onClick={() => setActiveForm("delete")}
            >
              Delete Course
            </Button>
          </ButtonGroup>

          {activeForm === "add" && (
            <Form onSubmit={handleAddCourse}>
              <FormGroup>
                <Label for="courseName" className="text-secondary">
                  Course Name
                </Label>
                <Input
                  type="text"
                  id="courseName"
                  placeholder="Enter Course Name"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="text-primary"
                />
              </FormGroup>
              <FormGroup>
                <Label for="courseCode" className="text-secondary">
                  Course Code
                </Label>
                <Input
                  type="text"
                  id="courseCode"
                  placeholder="Enter Course Code"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                  className="text-primary"
                />
              </FormGroup>
              <Button  
              style={{
              backgroundColor: "#17a2b8",
              color: "#fff",
              }}
             type="submit" className="w-100 mt-3">
                Add Course
              </Button>
            </Form>
          )}

          {activeForm === "update" && (
            <Form onSubmit={handleUpdateCourse}>
              <FormGroup>
                <Label for="courseId" className="text-secondary">
                  Select Course
                </Label>
                <Input
                  type="select"
                  id="courseId"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="text-primary"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="courseName" className="text-secondary">
                  Updated Course Name
                </Label>
                <Input
                  type="text"
                  id="courseName"
                  placeholder="Enter New Course Name"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="text-primary"
                />
              </FormGroup>
              <FormGroup>
                <Label for="courseCode" className="text-secondary">
                  Updated Course Code
                </Label>
                <Input
                  type="text"
                  id="courseCode"
                  placeholder="Enter New Course Code"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                  className="text-primary"
                />
              </FormGroup>
              <Button 
                style={{
                  backgroundColor: "#17a2b8",
                  color: "#fff",
                  }}
              type="submit" className="w-100 mt-3">
                Update Course
              </Button>
            </Form>
          )}

          {activeForm === "delete" && (
            <Form onSubmit={handleDeleteCourse}>
              <FormGroup>
                <Label for="courseId" className="text-secondary">
                  Select Course
                </Label>
                <Input
                  type="select"
                  id="courseId"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="text-primary"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <Button color="danger" type="submit" className="w-100 mt-3">
                Delete Course
              </Button>
            </Form>
          )}
        </CardBody>
      </Card>

      {/* Modal for Alerts */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Notification</ModalHeader>
        <ModalBody>{modalMessage}</ModalBody>
        <ModalFooter>
          <Button 
            style={{
              backgroundColor: "#17a2b8",
              color: "#fff",
              }} onClick={toggleModal}>
            OK
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default AddCourse;
