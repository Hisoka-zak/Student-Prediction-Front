// NavbarComponent.js
import React, { useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  NavbarToggler,
  Collapse,
  Modal,
  ModalBody,
  ModalHeader,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { PiListStarBold } from 'react-icons/pi';
import UserGuide from './UserGaide';

const NavbarComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <Navbar
        color="dark"
        dark
        expand="md"
        className="px-4 py-3 shadow"
        fixed="top"
        style={{
          backgroundColor: '#212529',
          borderBottom: '2px solid #17a2b8',
          marginBottom:'100px'
        }}
      >
        <NavbarBrand
          href="/"
          style={{
            fontWeight: 'bold',
            fontSize: '1.5rem',
            color: '#17a2b8',
          }}
        >
          Student Academic
        </NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mx-auto" navbar style={{ textAlign: 'center' }}>
            <NavItem>
              <NavLink
                tag={Link}
                to="/MangeCourses"
                className="nav-link-modern"
                style={{ padding: '0 1rem' }}
              >
                Manage Courses
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={Link}
                to="/Dataset-Store"
                className="nav-link-modern"
                style={{ padding: '0 1rem' }}
              >
                Model Training
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={Link}
                to="/"
                className="nav-link-modern"
                style={{ padding: '0 1rem' }}
              >
                Student Prediction
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={Link}
                to="/Dataset-Prediction"
                className="nav-link-modern"
                style={{ padding: '0 1rem' }}
              >
                Dataset Prediction
              </NavLink>
            </NavItem>
          </Nav>
          {/* Icon on the right */}
          <div className="d-flex align-items-center">
            <PiListStarBold
              onClick={toggleModal}
              style={{
                color: '#17a2b8',
                fontSize: '1.8rem',
                cursor: 'pointer',
              }}
              title="Features"
            />
          </div>
        </Collapse>
      </Navbar>

      {/* Modal for Overlay */}
      <Modal isOpen={isModalOpen} style={{maxWidth:'900px'}} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal} className="bg-light text-white">
          <h5 className="mb-0 text-dark">User Guide <PiListStarBold/></h5>
        </ModalHeader>
        <ModalBody
          style={{
            maxHeight: '500px',
            maxWidth: '1000px',
            overflowY: 'auto', // Enables scrolling for long content
            padding: '20px',
          }}
        >
          <UserGuide />
        </ModalBody>
      </Modal>
    </>
  );
};

export default NavbarComponent;
