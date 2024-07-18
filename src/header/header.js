import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function Header() {
  return (
    <Navbar bg="dark" expand="lg" className="p-3 navbar-dark">
      <Navbar.Brand as={Link} to="/" className="fw-bolder">
        Decode Trails
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/employee-form">
            Employee Form
          </Nav.Link>
          <Nav.Link as={Link} to="/employee-list">
            Employee List
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
