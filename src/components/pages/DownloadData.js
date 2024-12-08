import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, FormGroup, Label, Input, Container, Spinner, Card, CardBody, CardHeader } from 'reactstrap';
import { CSVLink } from 'react-csv';


export default function DownloadData() {
  const [datasets, setDatasets] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterSemester, setFilterSemester] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('https://student-prediction-db.onrender.com/api/datasets/filter')
      .then((response) => {
        setDatasets(response.data);
        setFilteredData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching datasets:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (filterSemester) {
      const filtered = datasets.filter((dataset) => dataset.sem === filterSemester);
      setFilteredData(filtered);
    } else {
      setFilteredData(datasets);
    }
  }, [filterSemester, datasets]);

  const semesters = ['sem1', 'sem2'];

  return (
    <Container
      style={{
        padding: '30px',
        maxWidth: '1500px',
        margin: '0 auto',
        paddingTop: '100px',
      }}
    >
      <Card className="shadow-lg mb-4">
        <CardHeader className="bg-dark text-white">
          <h2 className="text-center mb-0">Download Datasets</h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center">
              <Spinner color="primary" />
              <p>Loading datasets...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 d-flex justify-content-between align-items-center">
                <FormGroup className="mb-0" style={{ flex: '1' }}>
                  <Label for="filterSemester" className="fw-bold">
                    Filter by Semester
                  </Label>
                  <Input
                    type="select"
                    id="filterSemester"
                    className='w-50'
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                  >
                    <option value="">-- Select Semester --</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
            <Table bordered responsive hover className="table-striped mt-4">
              <thead className="bg-primary text-white text-center">
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "25%" }}>Course Name</th>
                  <th style={{ width: "25%" }}>Academic Year</th>
                  <th style={{ width: "25%" }}>Columns</th>
                  <th style={{ width: "0%" }}>Download</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((dataset, index) => {
                    const headers = dataset.columns.map((col) => ({ label: col, key: col }));

                    // Transform data: Convert array of arrays to array of objects
                    const transformedData = dataset.data.map((row) => {
                      const rowObject = {};
                      dataset.columns.forEach((col, idx) => {
                        rowObject[col] = row[idx]; // Map each column to its corresponding value
                      });
                      return rowObject;
                    });

                    console.log("Headers for dataset:", headers);
                    console.log("Transformed Data for dataset:", transformedData);

                    return (
                      <tr key={dataset._id} className="align-middle">
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">
                          {typeof dataset.course === "string"
                            ? dataset.course
                            : dataset.course?.name || "Unknown"}
                        </td>
                        <td className="text-center">
                          <Input
                            type="select"
                            className="bg-light"
                            readOnly
                            onClick={(e) => e.preventDefault()}
                          >
                            <option>-- Click To Show --</option>
                            {dataset.academicYear.map((year, idx) => (
                              <option key={idx} disabled>
                                {year}
                              </option>
                            ))}
                          </Input>
                        </td>
                        <td className="text-center">
                          <Input
                            type="select"
                            className="bg-light"
                            readOnly
                            onClick={(e) => e.preventDefault()}
                          >
                            <option>-- Click To Show --</option>
                            {dataset.columns.map((col, idx) => (
                              <option key={idx} disabled>
                                {col}
                              </option>
                            ))}
                          </Input>
                        </td>
                        <td className="text-center">
                          <CSVLink
                            data={transformedData}
                            headers={headers}
                            filename={`${dataset.course?.name || "dataset"}.csv`}
                            className="no-underline"
                          >
                            <button className="button">
                              <span className="button__text">Download</span>
                              <span className="button__icon">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 35 35"
                                  className="svg"
                                >
                                  <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path>
                                  <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path>
                                  <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path>
                                </svg>
                              </span>
                            </button>
                          </CSVLink>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No datasets found for the selected semester.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            </>
          )}
        </CardBody>
      </Card>
    </Container>
  );
}
