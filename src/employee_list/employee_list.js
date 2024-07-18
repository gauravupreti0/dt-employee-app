import React, { useEffect, useState, CSSProperties } from "react";
import ReactDOM from "react-dom";
import "./employee_list.css";
import Swal from "sweetalert2";
import ClipLoader from "react-spinners/ClipLoader";
import { getEmployeeData, deleteEmployee, search } from "../services/services";
import EmployeeForm from "../employee_form/employee_form";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "black",
};

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState({ column: "", order: "asc" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // getting the employee data from the database
    fetchEmployee();
  }, [currentPage, pageSize, sortBy]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const employees = await getEmployeeData(
        currentPage,
        pageSize,
        sortBy.column,
        sortBy.order
      );
      setTimeout(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, employees.length);
        const data = employees.slice(startIndex, endIndex);
        setEmployees(data);
        setTotalPages(Math.ceil(employees.length / pageSize));
      }, 500);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const handleDelete = async (employeeId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this employee?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      try {
        await deleteEmployee(employeeId);
        // const updatedData = await getEmployeeData();
        // setEmployees(updatedData);
        await fetchEmployee();
        Swal.fire("Deleted!", "Employee has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting employee:", error);
        Swal.fire(
          "Error!",
          "There was a problem deleting the employee.",
          "error"
        );
      }
    } else {
      Swal.fire("Cancelled", "Employee is not deleted.", "info");
    }
  };

  const handleUpdate = async (employee) => {
    const result = await Swal.fire({
      html: '<div id="employeeForm"></div>',
      showCancelButton: false,
      showConfirmButton: false,
      customClass: {
        container: "custom-swal-container",
        popup: "custom-swal-popup",
        content: "custom-swal-content",
      },
      didOpen: () => {
        ReactDOM.render(
          <EmployeeForm employeeId={employee} />,
          document.getElementById("employeeForm")
        );
      },
      // preConfirm: async () => { },
    });
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const params = searchText;
      const data = await search(params);
      setEmployees(data);
      if (data && data.length == 0) {
        Swal.fire({
          icon: "info",
          title: "info",
          text: "No data found!",
        });
      }
    } catch (error) {
      console.error("Error searching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error searching the data",
      });
    }
  };

  const handleInputChange = async (event) => {
    if (event.target.value === "") {
      const updatedData = await getEmployeeData();
      setSearchText("");
      setEmployees(updatedData);
    } else {
      setSearchText(event.target.value);
    }
    if (event.target?.keyCode === 13) {
      await handleSearch();
    }
  };

  const handleSort = (columnName) => {
    console.log(`sort by - ${columnName}`);
    const newOrder =
      sortBy.column === columnName && sortBy.order === "asc" ? "desc" : "asc";
    setSortBy({ column: columnName, order: newOrder });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <a className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </a>
        </li>
      );
    }
    return (
      <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-end">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <a
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              tabIndex="-1"
            >
              Previous
            </a>
          </li>
          {pages}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <a
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <>
      <nav className="navbar navbar-light mt-4">
        <div className="container">
          <div className="row w-100 ">
            <div className="col d-flex justify-content-center">
              <form className="form-inline w-100" onSubmit={handleSearch}>
                <div className="input-group w-80">
                  <input
                    className="form-control search-bar"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    value={searchText}
                    onChange={handleInputChange}
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-outline-success my-2 my-sm-0 ml-2"
                      type="submit"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <div className="mt-5 mb-5 p-3">
        <h2 className="mb-5 text-center fw-bolder">Employee Data</h2>
        <table className="table table-hover table-striped-columns">
          <thead>
            <tr>
              <th onClick={() => handleSort("emailAddress")}>Email</th>
              <th onClick={() => handleSort("countryName")}>Country</th>
              <th onClick={() => handleSort("stateName")}>State</th>
              <th onClick={() => handleSort("cityName")}>City</th>
              <th onClick={() => handleSort("panNumber")}>PAN</th>
              <th onClick={() => handleSort("passportNumber")}>Passport</th>
              <th onClick={() => handleSort("gender")}>Gender</th>
              <th>isActive</th>
              <th>Profile Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="custom-loader">
                  <ClipLoader
                    color={"#00000"}
                    loading={loading}
                    cssOverride={override}
                    size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </td>
              </tr>
            ) : (
              employees.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.emailAddress}</td>
                  <td>{employee.countryName}</td>
                  <td>{employee.stateName}</td>
                  <td>{employee.cityName}</td>
                  <td>{employee.panNumber}</td>
                  <td>{employee.passportNumber}</td>
                  <td>{employee.gender === 1 ? "Male" : "Female"}</td>
                  <td>{employee.isActive ? "Active" : "Inactive"}</td>
                  <td className="profile-image-section">
                    <img
                      src={employee.profileImage}
                      alt="Profile"
                      className="profile-image"
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-info m-1"
                      onClick={() => handleUpdate(employee.row_Id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger m-1"
                      onClick={() => handleDelete(employee.row_Id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="employee-list-pagination">{renderPagination()}</div>
      </div>
    </>
  );
}

export default EmployeeList;
