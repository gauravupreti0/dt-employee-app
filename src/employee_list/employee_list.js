import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./employee_list.css";
import Swal from "sweetalert2";
import { getEmployeeData, deleteEmployee, search } from "../services/services";
import EmployeeForm from "../employee_form/employee_form";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");

  const dummyData = [
    {
      row_Id: 0,
      employeeCode: "00981232",
      firstName: "Gaurav",
      lastName: "Upreti",
      countryId: 0,
      stateId: 0,
      cityId: 0,
      emailAddress: "user@example.com",
      mobileNumber: "9834983409",
      panNumber: "DHGSJ56J",
      passportNumber: "Z67545JK",
      profileImage: "localhost/",
      gender: 1,
      isActive: true,
      dateOfBirth: "2024-05-14T09:58:40.501Z",
      dateOfJoinee: "2024-05-14T09:58:40.501Z",
      createdDate: "2024-05-14T09:58:40.501Z",
      updatedDate: "2024-05-14T09:58:40.501Z",
      isDeleted: true,
      deletedDate: "2024-05-14T09:58:40.501Z",
    },
  ];

  // getting the employee data from the database
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // const data = await getEmployeeData();
        setEmployees(dummyData);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };
    fetchEmployee();
  }, []);

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
        const updatedData = await getEmployeeData();
        setEmployees(updatedData);
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
      showCancelButton: true,
      didOpen: () => {
        ReactDOM.render(
          <EmployeeForm employeeId={employee} />,
          document.getElementById("employeeForm")
        );
      },
      preConfirm: async () => {},
    });
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const params = searchText;
      const data = await search(params);
      setEmployees(data);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data fetched successfully",
      });
    } catch (error) {
      console.error("Error searching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error searching the data",
      });
    }
  };

  const handleInputChange = (event) => {
    setSearchText(event.target.value);
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
              <th>Email</th>
              <th>Country</th>
              <th>State</th>
              <th>City</th>
              <th>PAN</th>
              <th>Passport</th>
              <th>Gender</th>
              <th>isActive</th>
              <th>Profile Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default EmployeeList;
