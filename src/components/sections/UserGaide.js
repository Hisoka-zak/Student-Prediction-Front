import React from 'react';

export default function UserGuide() {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#17a2b8', marginBottom: '20px' }}>
        How to Use the System?
      </h2>

      <p>
        Welcome to the <strong>Student Academic Management System</strong>! Here's a detailed guide to help you navigate and make the most of the features:
      </p>

      <h4 style={{ color: '#17a2b8' }}>1. Course Management</h4>
      <ul>
        <li><strong>Purpose:</strong> Add, update, or delete courses and their assessments.</li>
        <li><strong>Steps:</strong>
          <ol>
            <li>Navigate to the <strong>Manage Courses</strong> page .</li>
            <li>Add new courses with associated assessments (e.g., assignments, exams).</li>
            <li>Edit or delete existing courses as needed.</li>
          </ol>
        </li>
        <li><strong>Use Case:</strong> Maintain a centralized list of courses and their grading components.</li>
      </ul>

      <h4 style={{ color: '#17a2b8' }}>2. Dataset Upload</h4>
      <ul>
        <li><strong>Purpose:</strong> Upload datasets for training machine learning models.</li>
        <li><strong>Steps:</strong>
          <ol>
            <li>Go to the <strong>Model Training</strong> page.</li>
            <li>Select a course, semester, and academic year.</li>
            <li>Upload a <code>.csv</code> or <code>.xlsx</code> file containing the dataset.</li>
            <li>The system validates and processes the dataset:
              <ul>
                <li>If a dataset for the same course already exists, you'll be prompted to concatenate it.</li>
              </ul>
            </li>
            <li>Monitor upload progress and view detailed status.</li>
          </ol>
        </li>
        <li><strong>Use Case:</strong> Prepare datasets for model training and ensure compatibility with course assessments.</li>
      </ul>

      <h4 style={{ color: '#17a2b8' }}>3. Model Training</h4>
      <ul>
        <li><strong>Purpose:</strong> Train models to analyze and predict student performance.</li>
        <li><strong>Steps:</strong>
          <ol>
            <li>Use the <strong>Model Training</strong> page to upload and prepare datasets.</li>
            <li>Train models for predicting student performance trends.</li>
            <li>Once training is complete, models are stored for future use.</li>
          </ol>
        </li>
        <li><strong>Use Case:</strong> Build predictive models to analyze student performance.</li>
      </ul>

      <h4 style={{ color: '#17a2b8' }}>4. Student Prediction</h4>
      <ul>
        <li><strong>Purpose:</strong> Predict individual or batch student grades.</li>
        <li><strong>Steps:</strong>
          <ol>
            <li>Navigate to the <strong>Student Prediction</strong> page.</li>
            <li>Upload student data or manually input individual details.</li>
            <li>Run the model to generate predictions.</li>
            <li>View and download the results for analysis.</li>
          </ol>
        </li>
        <li><strong>Use Case:</strong> Generate performance insights for students or classes.</li>
      </ul>

      <h4 style={{ color: '#17a2b8' }}>5. Dataset Prediction</h4>
      <ul>
        <li><strong>Purpose:</strong> Perform batch predictions on datasets.</li>
        <li><strong>Steps:</strong>
          <ol>
            <li>Go to the <strong>Dataset Prediction</strong> page.</li>
            <li>Select a course and upload a dataset for predictions.</li>
            <li>Monitor progress and view detailed predictions:
              <ul>
                <li>Grade counts by category.</li>
                <li>Download results as a <code>CSV</code> file.</li>
              </ul>
            </li>
          </ol>
        </li>
        <li><strong>Use Case:</strong> Predict grades for large datasets efficiently.</li>
      </ul>

      <h4 style={{ color: '#17a2b8' }}>6. Download Data</h4>
      <ul>
        <li><strong>Purpose:</strong> Access, filter, and download stored datasets.</li>
        <li><strong>Steps:</strong>
          <ol>
            <li>Go to the <strong>Dataset Store</strong> page.</li>
            <li>Filter datasets by course name or semester (e.g., <code>sem1</code>, <code>sem2</code>).</li>
            <li>View dataset details such as columns, academic years, and sizes.</li>
            <li>Download datasets in <code>CSV</code> format for offline use.</li>
          </ol>
        </li>
        <li><strong>Use Case:</strong> Retrieve and analyze historical data or predictions.</li>
      </ul>

      <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '1rem', color: '#6c757d' }}>
        This guide provides everything you need to manage courses, datasets, and predictions effectively. 🚀
      </p>
    </div>
  );
}
